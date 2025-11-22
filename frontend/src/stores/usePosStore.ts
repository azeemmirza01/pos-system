import { create } from 'zustand';
import db from '../services/database';
import syncService from '../services/sync';
import type { PosStore, Product, Customer, SaleData, SyncStatus, Outlet, Order } from '../types';
import type { Currency } from '../utils/currency';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Safe localStorage access - Always default to USD
const getStoredCurrency = (): Currency => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('currency');
      if (stored === 'USD' || stored === 'EUR') {
        return stored as Currency;
      }
      // If no currency stored or invalid, set USD as default
      localStorage.setItem('currency', 'USD');
    }
  } catch (error) {
    console.warn('Error accessing localStorage:', error);
  }
  // Always return USD as default
  return 'USD';
};

const usePosStore = create<PosStore>((set, get) => {
  console.log('[Store] Creating POS store...');
  
  return {
  // State
  products: [],
  customers: [],
  cart: [],
  currentSale: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncStatus: 'idle' as SyncStatus,
  currency: getStoredCurrency(),
  currentOutlet: undefined,
  outlets: [],
  orders: [],
  tables: [],
  taxes: [],
  isFullScreen: false,

  // Initialize
  initialize: async () => {
    try {
      // Load currency preference, always default to USD if not set
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedCurrency = localStorage.getItem('currency') as Currency;
          if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'EUR')) {
            set({ currency: savedCurrency });
          } else {
            // Always default to USD if not set or invalid
            localStorage.setItem('currency', 'USD');
            set({ currency: 'USD' });
          }
        } else {
          // If localStorage not available, default to USD
          set({ currency: 'USD' });
        }
      } catch (storageError) {
        console.warn('Error accessing localStorage:', storageError);
        // Always default to USD on error
        set({ currency: 'USD' });
      }
      
      // Start auto sync (only if sync service is available)
      try {
        if (syncService && typeof syncService.startAutoSync === 'function') {
      syncService.startAutoSync(30000);
        }
      } catch (error) {
        console.warn('Sync service not available:', error);
        // Don't fail initialization if sync service fails
      }
      
      // Load initial data (don't fail if these fail, and don't block)
      // Run these in background - don't await
      Promise.all([
        get().loadProducts().catch(error => {
          console.warn('[Store] Failed to load products:', error);
        }),
        get().loadCustomers().catch(error => {
          console.warn('[Store] Failed to load customers:', error);
        })
      ]).catch(error => {
        console.warn('[Store] Error loading initial data:', error);
      });
      
      console.log('[Store] Initialization complete (data loading in background)');
      
      // Set up online/offline listeners
      if (typeof window !== 'undefined') {
        if (window.electronAPI && typeof window.electronAPI.onOnline === 'function') {
          window.electronAPI.onOnline(() => set({ isOnline: true }));
          window.electronAPI.onOffline(() => set({ isOnline: false }));
        } else {
          window.addEventListener('online', () => set({ isOnline: true }));
          window.addEventListener('offline', () => set({ isOnline: false }));
        }
      }
    } catch (error) {
      console.error('Error initializing POS store:', error);
    }
  },

  // Currency
  setCurrency: (currency: Currency) => {
    console.log('[Store] setCurrency called with:', currency);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currency', currency);
        console.log('[Store] Saved to localStorage:', currency);
      }
    } catch (error) {
      console.warn('Error saving currency to localStorage:', error);
    }
    set({ currency });
    console.log('[Store] State updated. Current currency:', get().currency);
  },

  // Products
  loadProducts: async () => {
    try {
      const products = await db.getProducts() as Product[];
      set({ products: products || [] });
    } catch (error) {
      console.error('Error loading products:', error);
      set({ products: [] });
    }
  },

  addProduct: async (product) => {
    try {
      const id = await db.createProduct(product);
      await get().loadProducts();
      return id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  updateProduct: async (id, product) => {
    try {
      await db.updateProduct(id, product);
      await get().loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await db.deleteProduct(id);
      await get().loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Customers
  loadCustomers: async () => {
    try {
      const customers = await db.getCustomers() as Customer[];
      set({ customers: customers || [] });
    } catch (error) {
      console.error('Error loading customers:', error);
      set({ customers: [] });
    }
  },

  addCustomer: async (customer) => {
    try {
      const id = await db.createCustomer(customer);
      await get().loadCustomers();
      return id;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },

  updateCustomer: async (id, customer) => {
    try {
      await db.updateCustomer(id, customer);
      await get().loadCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await db.deleteCustomer(id);
      await get().loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Cart
  addToCart: (product) => {
    const cart = [...get().cart];
    const existingItem = cart.find(item => item.product_id === product.id);
    const price = Number(product.price) || 0;
    
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total = Number(existingItem.quantity) * Number(existingItem.price);
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        price: price,
        quantity: 1,
        total: price,
        image_url: product.image_url || null
      });
    }
    
    set({ cart });
  },

  removeFromCart: (productId) => {
    const cart = get().cart.filter(item => item.product_id !== productId);
    set({ cart });
  },

  updateCartItemQuantity: (productId, quantity) => {
    const cart = get().cart.map(item => {
      if (item.product_id === productId) {
        const newQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
        const price = Number(item.price) || 0;
        return {
          ...item,
          quantity: newQuantity,
          total: price * newQuantity
        };
      }
      return item;
    });
    set({ cart });
  },

  clearCart: () => {
    set({ cart: [] });
  },

  // Sales
  createSale: async (saleData) => {
    try {
      const cart = get().cart;
      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }

      const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
      const discount = saleData.discount || 0;
      const tax = saleData.tax || 0;
      const totalAmount = subtotal + tax - discount;
      
      const sale: SaleData = {
        ...saleData,
        subtotal: subtotal,
        total_amount: totalAmount,
        discount: discount,
        tax: tax,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      };

      const result = await db.createSale(sale);
      get().clearCart();
      return result;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },

  // Sync
  sync: async () => {
    set({ syncStatus: 'syncing' });
    try {
      await syncService.sync();
      set({ syncStatus: 'success' });
      setTimeout(() => set({ syncStatus: 'idle' }), 2000);
    } catch (error) {
      set({ syncStatus: 'error' });
      console.error('Sync error:', error);
    }
  },

  // Outlets
  loadOutlets: async () => {
    try {
      if (get().isOnline) {
        console.log('[Store] Fetching outlets from:', `${API_BASE_URL}/outlets`);
        const response = await axios.get(`${API_BASE_URL}/outlets`);
        const outlets = response.data || [];
        console.log('[Store] Received outlets from API:', outlets.length, outlets);
        set({ outlets });
        console.log('[Store] Store updated with outlets. Current state:', get().outlets.length);
        return outlets;
      } else {
        console.warn('[Store] Cannot load outlets: offline');
        return [];
      }
    } catch (error: any) {
      console.error('[Store] Error loading outlets:', error);
      console.error('[Store] Error details:', error.response?.data || error.message);
      set({ outlets: [] });
      throw error;
    }
  },

  setOutlet: (outlet: Outlet) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currentOutlet', JSON.stringify(outlet));
      }
    } catch (error) {
      console.warn('Error saving outlet to localStorage:', error);
    }
    set({ currentOutlet: outlet });
  },

  // Tables
  loadTables: async () => {
    try {
      if (get().isOnline) {
        const outletId = get().currentOutlet?.id;
        const response = await axios.get(`${API_BASE_URL}/tables${outletId ? `?outlet_id=${outletId}` : ''}`);
        set({ tables: response.data });
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  },

  // Taxes
  loadTaxes: async () => {
    try {
      if (get().isOnline) {
        const outletId = get().currentOutlet?.id;
        const response = await axios.get(`${API_BASE_URL}/taxes${outletId ? `?outlet_id=${outletId}` : ''}`);
        set({ taxes: response.data });
      }
    } catch (error) {
      console.error('Error loading taxes:', error);
    }
  },

  // Orders
  loadOrders: async () => {
    try {
      if (get().isOnline) {
        const outletId = get().currentOutlet?.id;
        const response = await axios.get(`${API_BASE_URL}/orders${outletId ? `?outlet_id=${outletId}` : ''}`);
        set({ orders: response.data });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  },

  createOrder: async (orderData: Partial<Order>) => {
    try {
      if (get().isOnline) {
        const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
        await get().loadOrders();
        return response.data;
      } else {
        // Save to local storage for offline
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const orders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
            const newOrder = {
              ...orderData,
              id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              order_number: `ORD-${Date.now()}`,
            };
            orders.push(newOrder);
            localStorage.setItem('offline_orders', JSON.stringify(orders));
            return newOrder;
          }
        } catch (error) {
          console.warn('Error saving offline order:', error);
        }
        // Return a basic order object even if localStorage fails
        return {
          ...orderData,
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          order_number: `ORD-${Date.now()}`,
        } as Order;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  setOrderType: (type: 'dine-in' | 'takeaway' | 'delivery') => {
    // Store order type in state if needed
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('orderType', type);
      }
    } catch (error) {
      console.warn('Error saving orderType to localStorage:', error);
    }
  },

  toggleFullScreen: () => {
    const isFullScreen = !get().isFullScreen;
    set({ isFullScreen });
    if (isFullScreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
  };
});

// Verify store is created correctly and log all methods
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      const state = usePosStore.getState();
      const methods = Object.keys(state).filter(key => typeof state[key as keyof typeof state] === 'function');
      console.log('[Store] POS store initialized. Available methods:', methods);
      console.log('[Store] createOrder available:', 'createOrder' in state, typeof state.createOrder);
      console.log('[Store] loadOrders available:', 'loadOrders' in state, typeof state.loadOrders);
      console.log('[Store] setOutlet available:', 'setOutlet' in state, typeof state.setOutlet);
    } catch (error) {
      console.error('[Store] Error accessing store state:', error);
    }
  }, 100);
}

export default usePosStore;

