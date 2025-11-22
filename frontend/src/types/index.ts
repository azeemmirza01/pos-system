export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
  min_stock?: number;
  category?: string;
  barcode?: string;
  image_url?: string;
  has_recipe?: boolean;
  recipe_id?: string;
  outlet_id?: string;
  is_active?: boolean;
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
  date_of_birth?: string;
  loyalty_points?: number;
  total_spent?: number;
  visit_count?: number;
  last_visit?: string;
  sms_opt_in?: boolean;
  email_opt_in?: boolean;
  tags?: string[];
  notes?: string;
  outlet_id?: string;
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
  order_id?: string;
  outlet_id?: string;
  total_amount: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  tax_details?: TaxDetail[];
  payment_method: string;
  status?: string;
  sale_type?: 'dine-in' | 'takeaway' | 'delivery';
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
  subtotal?: number;
  total_amount?: number;
  items: SaleItem[];
  sale_type?: 'dine-in' | 'takeaway' | 'delivery';
  outlet_id?: string;
}

export interface TaxDetail {
  tax_id: string;
  tax_name: string;
  tax_rate: number;
  tax_amount: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// Recipe & Ingredients
export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  cost_per_unit: number;
  supplier?: string;
  category?: string;
  outlet_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecipeIngredient {
  ingredient_id: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  product_id: string;
  name: string;
  ingredients: RecipeIngredient[];
  instructions?: string;
  preparation_time?: number;
  outlet_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Outlets
export interface Outlet {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  settings?: {
    currency?: string;
    timezone?: string;
    tax_enabled?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// Tables & Reservations
export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  outlet_id: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  table_id?: string;
  table_number?: string;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  special_requests?: string;
  outlet_id: string;
  created_at?: string;
  updated_at?: string;
}

// Orders
export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  station: 'kitchen' | 'bar' | 'none';
}

export interface Order {
  id: string;
  order_number: string;
  order_type: 'dine-in' | 'takeaway' | 'delivery';
  table_id?: string;
  table_number?: string;
  customer_id?: string;
  customer_name?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  status: 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  waiter_id?: string;
  waiter_name?: string;
  delivery_address?: string;
  delivery_phone?: string;
  notes?: string;
  outlet_id: string;
  created_at?: string;
  updated_at?: string;
}

// Taxes
export interface Tax {
  id: string;
  name: string;
  rate: number;
  type: 'VAT' | 'GST' | 'HST' | 'CUSTOM';
  is_active: boolean;
  applies_to: string[];
  outlet_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Waste
export interface Waste {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  reason?: string;
  cost: number;
  reported_by?: string;
  outlet_id: string;
  created_at?: string;
}

// Roles & Permissions
export interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  created_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

// Promotions
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: 'discount_percentage' | 'discount_fixed' | 'buy_x_get_y' | 'free_item';
  value: number;
  start_date: string;
  end_date: string;
  applicable_products?: string[];
  applicable_customers?: string[];
  min_purchase?: number;
  max_discount?: number;
  is_active: boolean;
  outlet_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PosStore {
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  currentSale: Sale | null;
  isOnline: boolean;
  syncStatus: SyncStatus;
  currency: 'USD' | 'EUR';
  currentOutlet?: Outlet;
  outlets: Outlet[];
  orders: Order[];
  tables: Table[];
  taxes: Tax[];
  isFullScreen: boolean;
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
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  setOrderType: (type: 'dine-in' | 'takeaway' | 'delivery') => void;
  toggleFullScreen: () => void;
  sync: () => Promise<void>;
  setCurrency: (currency: 'USD' | 'EUR') => void;
  setOutlet: (outlet: Outlet) => void;
  loadOutlets: () => Promise<void>;
  loadTables: () => Promise<void>;
  loadTaxes: () => Promise<void>;
  loadOrders: () => Promise<void>;
}

