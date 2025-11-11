# How to Fix "No handler registered" Error

## The Problem
The error "No handler registered for 'image:select'" occurs because the Electron process is running old code. The handlers are defined in the code, but Electron needs to be fully restarted to load them.

## Solution: Full Restart

### Step 1: Stop All Processes
1. In your terminal, press `Ctrl+C` (or `Cmd+C` on Mac) to stop the dev server
2. Wait for all processes to stop completely

### Step 2: Kill Any Remaining Electron Processes
```bash
# On macOS/Linux
pkill -f electron

# Or manually kill the process
# Find the process ID:
ps aux | grep electron
# Then kill it:
kill -9 <PID>
```

### Step 3: Clear Cache (Optional but Recommended)
```bash
# Clear Electron cache
rm -rf ~/Library/Application\ Support/pos-system
# Or on Linux:
# rm -rf ~/.config/pos-system
# Or on Windows:
# Delete %APPDATA%\pos-system
```

### Step 4: Restart the Application
```bash
npm run dev
```

## Verification

After restarting, you should see in the terminal:
- "IPC handlers registered"
- "Database initialized"
- "Window created, IPC handlers should be available"

If you still see the error after a full restart:
1. Check the terminal output for any errors
2. Verify that `electron/preload.js` exists
3. Verify that `electron/main.js` exists
4. Check that the image handlers are in the code

## Alternative: Manual Restart

If the above doesn't work:

1. **Close the Electron window completely**
2. **Stop the terminal process** (Ctrl+C)
3. **Wait 5 seconds**
4. **Start again**: `npm run dev`

## Still Having Issues?

Check the following:

1. **Check Electron version**: 
   ```bash
   ./node_modules/.bin/electron --version
   ```

2. **Verify handlers are registered**:
   Look for "IPC handlers registered" in the terminal output

3. **Check preload script**:
   Verify `electron/preload.js` has the `selectImage` function exposed

4. **Check main process**:
   Verify `electron/main.js` has the `ipcMain.handle('image:select', ...)` handler

## Quick Test

After restarting, try this in the browser console (DevTools):
```javascript
window.electronAPI.selectImage().then(console.log).catch(console.error)
```

If this works, the handlers are registered correctly!

