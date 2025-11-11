const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  dbQuery: (query, params) => ipcRenderer.invoke('db:query', query, params),
  dbExec: (query, params) => ipcRenderer.invoke('db:exec', query, params),
  dbGet: (query, params) => ipcRenderer.invoke('db:get', query, params),
  dbAll: (query, params) => ipcRenderer.invoke('db:all', query, params),
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  
  // Image operations
  selectImage: () => ipcRenderer.invoke('image:select'),
  saveImage: (imageData, filename) => ipcRenderer.invoke('image:save', imageData, filename),
  getImagePath: (filename) => ipcRenderer.invoke('image:getPath', filename),
  deleteImage: (filename) => ipcRenderer.invoke('image:delete', filename),
  
  // Online/offline status
  isOnline: () => navigator.onLine,
  onOnline: (callback) => window.addEventListener('online', callback),
  onOffline: (callback) => window.addEventListener('offline', callback)
});

