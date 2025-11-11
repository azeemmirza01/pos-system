import axios from 'axios';
import db from './database';

const getApiUrl = () => {
  return localStorage.getItem('apiUrl') || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInterval = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (typeof window !== 'undefined') {
      if (window.electronAPI && typeof window.electronAPI.onOnline === 'function') {
        window.electronAPI.onOnline(() => {
          this.isOnline = true;
          this.sync();
        });
        
        window.electronAPI.onOffline(() => {
          this.isOnline = false;
        });
      } else {
        window.addEventListener('online', () => {
          this.isOnline = true;
          this.sync();
        });
        
        window.addEventListener('offline', () => {
          this.isOnline = false;
        });
      }
    }
  }

  startAutoSync(intervalMs = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.sync();
      }
    }, intervalMs);
    
    // Sync immediately if online
    if (this.isOnline) {
      this.sync();
    }
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync() {
    if (!this.isOnline) {
      console.log('Offline - skipping sync');
      return;
    }

    try {
      const queue = await db.getSyncQueue();
      
      if (queue.length === 0) {
        console.log('No items to sync');
        return;
      }

      console.log(`Syncing ${queue.length} items...`);

      for (const item of queue) {
        try {
          const data = JSON.parse(item.data);
          
          switch (item.operation) {
            case 'create':
              await this.syncCreate(item.table_name, item.record_id, data);
              break;
            case 'update':
              await this.syncUpdate(item.table_name, item.record_id, data);
              break;
            case 'delete':
              await this.syncDelete(item.table_name, item.record_id);
              break;
          }
          
          await db.markSynced(item.id);
          
          // Update the main record as synced
          await this.markRecordSynced(item.table_name, item.record_id);
          
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }

      console.log('Sync completed');
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  async syncCreate(tableName, recordId, data) {
    const endpoint = this.getEndpoint(tableName);
    if (!endpoint) return;

    try {
      await axios.post(`${getApiUrl()}${endpoint}`, {
        ...data,
        id: recordId,
        local_id: recordId
      });
    } catch (error) {
      if (error.response?.status === 409) {
        // Record already exists, try update instead
        await this.syncUpdate(tableName, recordId, data);
      } else {
        throw error;
      }
    }
  }

  async syncUpdate(tableName, recordId, data) {
    const endpoint = this.getEndpoint(tableName);
    if (!endpoint) return;

    await axios.put(`${getApiUrl()}${endpoint}/${recordId}`, {
      ...data,
      id: recordId
    });
  }

  async syncDelete(tableName, recordId) {
    const endpoint = this.getEndpoint(tableName);
    if (!endpoint) return;

    await axios.delete(`${getApiUrl()}${endpoint}/${recordId}`);
  }

  async markRecordSynced(tableName, recordId) {
    const sql = `UPDATE ${tableName} SET synced = 1 WHERE id = ?`;
    await db.query(sql, [recordId]);
  }

  getEndpoint(tableName) {
    const endpoints = {
      'products': '/products',
      'customers': '/customers',
      'sales': '/sales',
      'sale_items': '/sale-items',
      'users': '/users'
    };
    return endpoints[tableName] || null;
  }

  async pullFromServer() {
    if (!this.isOnline) {
      console.log('Offline - cannot pull from server');
      return;
    }

    try {
      // Pull products
      const productsResponse = await axios.get(`${getApiUrl()}/products`);
      const products = productsResponse.data;
      
      for (const product of products) {
        const existing = await db.getProduct(product.id);
        if (!existing) {
          await db.createProduct(product);
        } else if (new Date(product.updated_at) > new Date(existing.updated_at)) {
          await db.updateProduct(product.id, product);
        }
      }

      // Pull customers
      const customersResponse = await axios.get(`${getApiUrl()}/customers`);
      const customers = customersResponse.data;
      
      for (const customer of customers) {
        const existing = await db.getCustomer(customer.id);
        if (!existing) {
          await db.createCustomer(customer);
        } else if (new Date(customer.updated_at) > new Date(existing.updated_at)) {
          await db.updateCustomer(customer.id, customer);
        }
      }

      console.log('Pull from server completed');
    } catch (error) {
      console.error('Pull from server error:', error);
    }
  }
}

export default new SyncService();

