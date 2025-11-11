interface ElectronAPI {
  dbQuery: (sql: string, params?: any[]) => Promise<any>;
  dbExec: (sql: string, params?: any[]) => Promise<any>;
  dbGet: (sql: string, params?: any[]) => Promise<any>;
  dbAll: (sql: string, params?: any[]) => Promise<any[]>;
  onOnline: (callback: () => void) => void;
  onOffline: (callback: () => void) => void;
  selectImage: () => Promise<string | null>;
  getImagePath: (filename: string) => Promise<string | null>;
  deleteImage: (filename: string) => Promise<void>;
}

interface Window {
  electronAPI?: ElectronAPI;
}

