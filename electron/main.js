const { app, BrowserWindow, ipcMain, dialog, Menu, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const Database = require('./database');

let mainWindow;
let db;

// Register custom protocol for secure local file access
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'pos',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function createWindow() {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const iconExists = fs.existsSync(iconPath);
  
  const preloadPath = path.join(__dirname, 'preload.js');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: true, // Enable web security in both dev and production
      allowRunningInsecureContent: false,
      // Enable DevTools in production for debugging (can be disabled later)
      devTools: true
    },
    ...(iconExists && { icon: iconPath }),
    show: false // Don't show until ready
  });
  
  // Set Content Security Policy without unsafe-eval to avoid warnings
  // Only apply CSP to HTML documents to avoid interfering with Vite dev server
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders };
    
    // Only set CSP for HTML documents (main frame)
    if (details.resourceType === 'mainFrame' || 
        (details.responseHeaders['content-type'] && 
         details.responseHeaders['content-type'][0]?.includes('text/html'))) {
      // Strict CSP without unsafe-eval - works in both dev and production
      // Vite HMR uses WebSocket (ws:) and inline scripts (unsafe-inline), which are allowed
      headers['Content-Security-Policy'] = [
        "default-src 'self' 'unsafe-inline' data: blob: pos:; " +
        "img-src 'self' data: blob: pos: http: https:; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data:; " +
        "connect-src 'self' http: https: ws: wss:; " +
        "worker-src 'self' blob:"
      ];
    }
    
    callback({ responseHeaders: headers });
  });
  
  // Show window when ready to prevent white screen flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Error handling for failed page loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // DevTools can be opened manually via menu (Cmd+Option+I / Ctrl+Shift+I)
  } else {
    // In production, handle path correctly for packaged apps
    let indexPath;
    
    // Get the app path (works for both packaged and unpackaged)
    const appPath = app.getAppPath();
    
    if (app.isPackaged) {
      // When packaged, files are in different locations depending on platform
      const possiblePaths = [
        path.join(appPath, 'frontend', 'dist', 'index.html'),
        path.join(process.resourcesPath || appPath, 'app', 'frontend', 'dist', 'index.html'),
        path.join(__dirname, '..', 'frontend', 'dist', 'index.html'),
        path.join(__dirname, 'frontend', 'dist', 'index.html'),
        path.join(process.resourcesPath || '', 'app', 'frontend', 'dist', 'index.html'),
      ];
      
      // Find the first path that exists
      indexPath = possiblePaths.find(p => fs.existsSync(p));
      
      if (!indexPath) {
        indexPath = path.join(appPath, 'frontend', 'dist', 'index.html');
      }
    } else {
      // Development build (not packaged)
      indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    }
    
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath).catch(err => {
        console.error('Error loading file:', err);
        // Try loading as URL as fallback
        const fileUrl = path.isAbsolute(indexPath) 
          ? `file://${indexPath}` 
          : `file://${path.resolve(indexPath)}`;
        mainWindow.loadURL(fileUrl).catch(urlErr => {
          console.error('Error loading URL:', urlErr);
        });
      });
    } else {
      console.error('index.html not found at:', indexPath);
      // DevTools can be opened manually via menu if needed for debugging
      mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.executeJavaScript(`
          document.body.innerHTML = '<div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px;">
              <h1 style="color: #ff4d4f; margin: 0 0 20px 0;">⚠️ Application Error</h1>
              <p style="color: #666; margin: 0 0 10px 0;"><strong>Files not found</strong></p>
              <p style="color: #999; font-size: 12px; margin: 20px 0;">Expected: ${indexPath}</p>
              <p style="color: #666; margin: 20px 0 0 0;">Please check the console (DevTools) for details.</p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">If this persists, please reinstall the application.</p>
            </div>
          </div>';
        `);
      });
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for database operations
ipcMain.handle('db:query', async (event, query, params) => {
  if (!db) {
    console.warn('Database not initialized, returning empty result');
    return [];
  }
  try {
    const result = db.query(query, params);
    // Serialize result for IPC
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
});

ipcMain.handle('db:exec', async (event, query, params) => {
  if (!db) {
    console.warn('Database not initialized, skipping exec');
    return;
  }
  try {
    return db.exec(query, params);
  } catch (error) {
    console.error('Database exec error:', error);
  }
});

ipcMain.handle('db:get', async (event, query, params) => {
  if (!db) {
    console.warn('Database not initialized, returning null');
    return null;
  }
  try {
    const result = db.get(query, params);
    // Serialize result for IPC
    return result ? JSON.parse(JSON.stringify(result)) : null;
  } catch (error) {
    console.error('Database get error:', error);
    return null;
  }
});

ipcMain.handle('db:all', async (event, query, params) => {
  if (!db) {
    console.warn('Database not initialized, returning empty array');
    return [];
  }
  try {
    const result = db.all(query, params);
    // Serialize result for IPC
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Database all error:', error);
    return [];
  }
});

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getPath', (event, name) => {
  return app.getPath(name);
});

// Image operations - Register these handlers immediately
ipcMain.handle('image:select', async (event) => {
  console.log('✅ image:select handler called from renderer');
  try {
    // Get the browser window that sent the request
    let win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      win = mainWindow;
    }
    if (!win) {
      // Get any available window
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        win = windows[0];
      }
    }
    
    // Show open dialog
    const dialogOptions = {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }
      ]
    };
    
    const result = win 
      ? await dialog.showOpenDialog(win, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);
    
    if (!result) {
      console.log('Dialog was cancelled or returned no result');
      return null;
    }
    
    const { canceled, filePaths } = result;

    if (canceled || !filePaths || filePaths.length === 0) {
      return null;
    }

    const imagePath = filePaths[0];
    const imageData = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath);
    const filename = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    
    // Save to images directory in userData
    const userDataPath = app.getPath('userData');
    const imagesDir = path.join(userDataPath, 'images');
    
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const destPath = path.join(imagesDir, filename);
    fs.writeFileSync(destPath, imageData);
    
    console.log('Image saved:', filename);
    return filename;
  } catch (error) {
    console.error('Error in image:select:', error);
    throw error;
  }
});

ipcMain.handle('image:save', async (event, imageData, filename) => {
  try {
    const userDataPath = app.getPath('userData');
    const imagesDir = path.join(userDataPath, 'images');
    
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const destPath = path.join(imagesDir, filename);
    
    // If imageData is base64, decode it
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      const base64Data = imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(destPath, buffer);
    } else {
      fs.writeFileSync(destPath, imageData);
    }
    
    return filename;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
});

ipcMain.handle('image:getPath', async (event, filename) => {
  if (!filename) return null;
  
  try {
    const userDataPath = app.getPath('userData');
    const imagePath = path.join(userDataPath, 'images', filename);
    
    if (fs.existsSync(imagePath)) {
      // Return pos:// protocol URL for secure local file access
      // This works with webSecurity enabled
      return `pos://images/${filename}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting image path:', error);
    return null;
  }
});

ipcMain.handle('image:delete', async (event, filename) => {
  if (!filename) return;
  
  try {
    const userDataPath = app.getPath('userData');
    const imagePath = path.join(userDataPath, 'images', filename);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
});

// IPC handlers registered

// Create application menu with DevTools option
function createMenu() {
  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Full Screen' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'About ' + app.getName() },
        { type: 'separator' },
        { role: 'services', label: 'Services' },
        { type: 'separator' },
        { role: 'hide', label: 'Hide ' + app.getName() },
        { role: 'hideOthers', label: 'Hide Others' },
        { role: 'unhide', label: 'Show All' },
        { type: 'separator' },
        { role: 'quit', label: 'Quit ' + app.getName() }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Register custom protocol handler for secure local file access
function registerProtocol() {
  protocol.registerFileProtocol('pos', (request, callback) => {
    const url = request.url.replace('pos://', '');
    
    // Handle image requests
    if (url.startsWith('images/')) {
      const filename = url.replace('images/', '');
      const userDataPath = app.getPath('userData');
      const imagePath = path.join(userDataPath, 'images', filename);
      
      if (fs.existsSync(imagePath)) {
        callback({ path: imagePath });
      } else {
        callback({ error: -6 }); // FILE_NOT_FOUND
      }
    } else {
      callback({ error: -6 }); // FILE_NOT_FOUND
    }
  });
}

app.whenReady().then(() => {
  // Register custom protocol before creating window
  registerProtocol();
  
  // Create application menu
  createMenu();
  
  try {
    // Initialize database
    db = new Database();
    db.initialize();
  } catch (error) {
    console.error('Database initialization error:', error);
    // App can work without local database - data will sync to backend when online
    db = null;
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

