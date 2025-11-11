// Database service for Electron IPC communication
import type { Product, Customer, Sale, SaleItem, SaleData } from '../types';

class DatabaseService {
  isElectronAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    if (this.isElectronAvailable()) {
      return await window.electronAPI!.dbQuery(sql, params);
    }
    console.warn('Electron API not available - database operations will fail');
    throw new Error('Electron API not available. Please run in Electron.');
  }

  async exec(sql: string, params: any[] = []): Promise<any> {
    if (this.isElectronAvailable()) {
      return await window.electronAPI!.dbExec(sql, params);
    }
    console.warn('Electron API not available - database operations will fail');
    throw new Error('Electron API not available. Please run in Electron.');
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    if (this.isElectronAvailable()) {
      return await window.electronAPI!.dbGet(sql, params);
    }
    console.warn('Electron API not available - database operations will fail');
    throw new Error('Electron API not available. Please run in Electron.');
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    if (this.isElectronAvailable()) {
      return await window.electronAPI!.dbAll(sql, params);
    }
    console.warn('Electron API not available - database operations will fail');
    throw new Error('Electron API not available. Please run in Electron.');
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await this.all('SELECT * FROM products ORDER BY name');
  }

  async getProduct(id: string): Promise<Product | null> {
    return await this.get('SELECT * FROM products WHERE id = ?', [id]);
  }

  async createProduct(product: Omit<Product, 'id' | 'synced' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sql = `INSERT INTO products (id, name, price, description, stock, category, barcode, image_url, synced)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`;
    await this.query(sql, [
      id,
      product.name,
      product.price,
      product.description || null,
      product.stock || 0,
      product.category || null,
      product.barcode || null,
      product.image_url || null
    ]);
    // Add to sync queue
    await this.addToSyncQueue('products', id, 'create', { ...product, id });
    return id;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const sql = `UPDATE products SET name = ?, price = ?, description = ?, stock = ?, 
                 category = ?, barcode = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP, synced = 0
                 WHERE id = ?`;
    await this.query(sql, [
      product.name,
      product.price,
      product.description || null,
      product.stock || 0,
      product.category || null,
      product.barcode || null,
      product.image_url || null,
      id
    ]);
    // Add to sync queue
    await this.addToSyncQueue('products', id, 'update', { ...product, id });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.query('DELETE FROM products WHERE id = ?', [id]);
    // Add to sync queue
    await this.addToSyncQueue('products', id, 'delete', { id });
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return await this.all('SELECT * FROM customers ORDER BY name');
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return await this.get('SELECT * FROM customers WHERE id = ?', [id]);
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'synced' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sql = `INSERT INTO customers (id, name, email, phone, address, synced)
                 VALUES (?, ?, ?, ?, ?, 0)`;
    await this.query(sql, [
      id,
      customer.name,
      customer.email || null,
      customer.phone || null,
      customer.address || null
    ]);
    // Add to sync queue
    await this.addToSyncQueue('customers', id, 'create', { ...customer, id });
    return id;
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
    const sql = `UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, 
                 updated_at = CURRENT_TIMESTAMP, synced = 0 WHERE id = ?`;
    await this.query(sql, [
      customer.name,
      customer.email || null,
      customer.phone || null,
      customer.address || null,
      id
    ]);
    // Add to sync queue
    await this.addToSyncQueue('customers', id, 'update', { ...customer, id });
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.query('DELETE FROM customers WHERE id = ?', [id]);
    // Add to sync queue
    await this.addToSyncQueue('customers', id, 'delete', { id });
  }

  // Sale methods
  async createSale(sale: SaleData): Promise<{ id: string; invoice_number: string }> {
    const id = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Create sale record
    const saleSql = `INSERT INTO sales (id, invoice_number, customer_id, total_amount, discount, tax, 
                      payment_method, status, synced)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`;
    await this.query(saleSql, [
      id,
      invoiceNumber,
      sale.customer_id || null,
      sale.total_amount || 0,
      sale.discount || 0,
      sale.tax || 0,
      sale.payment_method || 'cash',
      'completed'
    ]);

    // Create sale items
    if (sale.items && sale.items.length > 0) {
      for (const item of sale.items) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const itemSql = `INSERT INTO sale_items (id, sale_id, product_id, quantity, price, total, synced)
                         VALUES (?, ?, ?, ?, ?, ?, 0)`;
        await this.query(itemSql, [
          itemId,
          id,
          item.product_id,
          item.quantity,
          item.price,
          item.total
        ]);
      }
    }

    // Add to sync queue - include all sale data
    const saleData = {
      ...sale,
      id,
      invoice_number: invoiceNumber
    };
    await this.addToSyncQueue('sales', id, 'create', saleData);
    
    return { id, invoice_number: invoiceNumber };
  }

  async getSales(limit: number = 100): Promise<Sale[]> {
    return await this.all(`
      SELECT s.*, c.name as customer_name 
      FROM sales s 
      LEFT JOIN customers c ON s.customer_id = c.id 
      ORDER BY s.created_at DESC 
      LIMIT ?
    `, [limit]);
  }

  async getSale(id: string): Promise<Sale | null> {
    const sale = await this.get('SELECT * FROM sales WHERE id = ?', [id]);
    if (sale) {
      sale.items = await this.all(`
        SELECT si.*, p.name as product_name 
        FROM sale_items si 
        JOIN products p ON si.product_id = p.id 
        WHERE si.sale_id = ?
      `, [id]);
    }
    return sale;
  }

  async getSaleItems(saleId: string): Promise<SaleItem[]> {
    return await this.all(`
      SELECT si.*, p.name as product_name, p.barcode 
      FROM sale_items si 
      JOIN products p ON si.product_id = p.id 
      WHERE si.sale_id = ?
    `, [saleId]);
  }

  // Sync queue methods
  async addToSyncQueue(tableName: string, recordId: string, operation: string, data: any): Promise<void> {
    try {
      const sql = `INSERT INTO sync_queue (table_name, record_id, operation, data, synced)
                   VALUES (?, ?, ?, ?, 0)`;
      await this.query(sql, [tableName, recordId, operation, JSON.stringify(data)]);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      // Don't throw - sync queue is optional
    }
  }

  async getSyncQueue(): Promise<any[]> {
    try {
      return await this.all('SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at');
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  async markSynced(queueId: number): Promise<void> {
    try {
      await this.query('UPDATE sync_queue SET synced = 1 WHERE id = ?', [queueId]);
    } catch (error) {
      console.error('Error marking sync queue as synced:', error);
    }
  }
}

export default new DatabaseService();

