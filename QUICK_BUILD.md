# Quick Build Guide

This is a quick guide to build installers for customer distribution.

## Prerequisites

1. Install all dependencies:
```bash
npm run install:all
```

2. Build the frontend:
```bash
npm run build:react
```

## Building Installers

### For macOS
```bash
npm run build:mac
```
Output: `dist/POS System-1.0.0.dmg`

### For Windows
```bash
npm run build:win
```
Output: `dist/POS System Setup 1.0.0.exe`

### For Linux
```bash
npm run build:linux
```
Output: `dist/POS System-1.0.0.AppImage` and `dist/pos-system_1.0.0_amd64.deb`

### For All Platforms (macOS only)
```bash
npm run build:all
```

## Distribution Files

After building, find installers in the `dist/` folder:

- **macOS**: `.dmg` file - Drag and drop installer
- **Windows**: `.exe` file - Standard Windows installer
- **Linux**: `.AppImage` (portable) and `.deb` (package manager)

## Testing the Build

1. **Test locally** (before building):
```bash
npm run build:react
npm start
```

2. **Test the installer**:
   - Install on a clean system (or VM)
   - Test all functionality
   - Verify data persistence

## File Sizes

Expected sizes:
- Installer: ~150-200 MB
- Installed app: ~200-300 MB

## Next Steps

1. Test the installer on a clean system
2. Distribute to customers
3. Provide installation instructions (see `INSTALLATION_GUIDE.md`)

## Troubleshooting

### Build Fails

1. **Check dependencies**:
```bash
npm run install:all
```

2. **Rebuild native modules**:
```bash
npm run rebuild
```

3. **Clear cache**:
```bash
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

### Icons Not Showing

Icons are optional. If you want custom icons:
1. Create icons (see `build/README.md`)
2. Place in `build/` folder
3. Update `package.json` build config
4. Rebuild

### Build Too Large

The build includes:
- Electron runtime
- Node.js dependencies
- React app (built)
- Backend server (optional)

To reduce size:
- Remove unused dependencies
- Use production builds
- Exclude backend if not needed

## Additional Resources

- **Full Distribution Guide**: See `DISTRIBUTION.md`
- **Installation Guide**: See `INSTALLATION_GUIDE.md`
- **Build Assets**: See `build/README.md`

