import { create } from 'zustand';
import db from '../services/database';
import syncService from '../services/sync';

const usePosStore = create((set, get) => ({
  // State
  products: [],
  customers: [],
  cart: [],
  currentSale: null,
  isOnline: navigator.onLine,
  syncStatus: 'idle',

  // Initialize
  initialize: async () => {
    try {
      // Start auto sync
      syncService.startAutoSync(30000);
      
      // Load initial data
      await get().loadProducts();
      await get().loadCustomers();
      
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

  // Products
  loadProducts: async () => {
    try {
      const products = await db.getProducts();
      set({ products });
    } catch (error) {
      console.error('Error loading products:', error);
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
      const customers = await db.getCustomers();
      set({ customers });
    } catch (error) {
      console.error('Error loading customers:', error);
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
    
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
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
        const newQuantity = Math.max(1, quantity);
        return {
          ...item,
          quantity: newQuantity,
          total: item.price * newQuantity
          // image_url is already preserved in the spread
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

      const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
      const sale = {
        ...saleData,
        total_amount: totalAmount,
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
  }
}));

export default usePosStore;

