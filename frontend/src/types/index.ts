export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
  category?: string;
  barcode?: string;
  image_url?: string;
  synced?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  synced?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
  image_url?: string | null;
}

export interface SaleItem {
  id?: string;
  sale_id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id?: string;
  invoice_number?: string;
  customer_id?: string | null;
  customer_name?: string;
  total_amount: number;
  discount?: number;
  tax?: number;
  payment_method: string;
  status?: string;
  items?: SaleItem[];
  synced?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SaleData {
  customer_id?: string | null;
  payment_method: string;
  discount?: number;
  tax?: number;
  total_amount?: number;
  items: SaleItem[];
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface PosStore {
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  currentSale: Sale | null;
  isOnline: boolean;
  syncStatus: SyncStatus;
  currency: 'USD' | 'EUR';
  initialize: () => Promise<void>;
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'synced' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  loadCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'synced' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createSale: (saleData: Omit<SaleData, 'items' | 'total_amount'>) => Promise<{ id: string; invoice_number: string }>;
  sync: () => Promise<void>;
  setCurrency: (currency: 'USD' | 'EUR') => void;
}

