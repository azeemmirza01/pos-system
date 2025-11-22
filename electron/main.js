const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const Database = require('./database');

let mainWindow;
let db;

function createWindow() {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const iconExists = fs.existsSync(iconPath);
  
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload path:', preloadPath);
  console.log('Preload exists:', fs.existsSync(preloadPath));
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: false // Allow loading local file:// URLs for images
    },
    ...(iconExists && { icon: iconPath })
  });
  
  console.log('Window created, IPC handlers should be available');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Automatically open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    // In production, allow opening DevTools with Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows/Linux)
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for database operations
ipcMain.handle('db:query', async (event, query, params) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const result = db.query(query, params);
  // Serialize result for IPC
  return JSON.parse(JSON.stringify(result));
});

ipcMain.handle('db:exec', async (event, query, params) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.exec(query, params);
});

ipcMain.handle('db:get', async (event, query, params) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const result = db.get(query, params);
  // Serialize result for IPC
  return result ? JSON.parse(JSON.stringify(result)) : null;
});

ipcMain.handle('db:all', async (event, query, params) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const result = db.all(query, params);
  // Serialize result for IPC
  return JSON.parse(JSON.stringify(result));
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
      // Return file:// URL for rendering in Electron
      // On Windows, we need to handle path separators differently
      const normalizedPath = process.platform === 'win32' 
        ? imagePath.replace(/\\/g, '/')
        : imagePath;
      return `file://${normalizedPath}`;
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

// Verify handlers are registered
console.log('IPC handlers registered');

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

app.whenReady().then(() => {
  console.log('App is ready');
  
  // Create application menu
  createMenu();
  
  try {
    // Initialize database
    db = new Database();
    db.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
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

