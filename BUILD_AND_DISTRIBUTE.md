# Complete Guide: Building and Distributing POS System

This is your complete guide to building and distributing the POS System to customers.

## Overview

The POS System is an Electron-based desktop application that works offline. To distribute it to customers, you need to:

1. Build the React frontend
2. Package everything with Electron
3. Create installers for each platform
4. Distribute the installers to customers

## Step-by-Step Process

### Step 1: Prepare Your Environment

1. **Install Node.js** (v18 or higher)
2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Verify everything works**:
   ```bash
   npm run dev
   ```
   Test the application to ensure everything works correctly.

### Step 2: Build the Frontend

The React frontend must be built before creating installers:

```bash
npm run build:react
```

This creates optimized production files in `frontend/dist/`.

### Step 3: Create Installers

#### Option A: Build for Your Current Platform

```bash
npm run build
```

This creates an installer for your current operating system.

#### Option B: Build for Specific Platform

**macOS**:
```bash
npm run build:mac
```
Creates: `dist/POS System-1.0.0.dmg`

**Windows** (on Windows or macOS with Wine):
```bash
npm run build:win
```
Creates: `dist/POS System Setup 1.0.0.exe`

**Linux** (on Linux or macOS):
```bash
npm run build:linux
```
Creates: `dist/POS System-1.0.0.AppImage` and `dist/pos-system_1.0.0_amd64.deb`

#### Option C: Build for All Platforms (macOS only)

```bash
npm run build:all
```

**Note**: You can build Windows installers on macOS, but Linux installers require Linux. For best results, build on the target platform.

### Step 4: Test the Installers

1. **Test on a clean system** (or virtual machine)
2. **Install the application**
3. **Test all functionality**:
   - Add products
   - Process sales
   - Test offline mode
   - Test cloud sync (if configured)

### Step 5: Distribute to Customers

1. **Upload installers** to:
   - Your website
   - Cloud storage (Google Drive, Dropbox)
   - File sharing service
   - USB drives

2. **Provide installation instructions** (see `INSTALLATION_GUIDE.md`)

3. **Provide support** for installation issues

## File Locations

### Installers
- Location: `dist/` folder
- Files:
  - macOS: `POS System-1.0.0.dmg`
  - Windows: `POS System Setup 1.0.0.exe`
  - Linux: `POS System-1.0.0.AppImage`

### Application Data (After Installation)

**Windows**:
- Data: `%APPDATA%\pos-system\`
- Logs: `%APPDATA%\pos-system\logs\`
- Database: `%APPDATA%\pos-system\database.sqlite`

**macOS**:
- Data: `~/Library/Application Support/pos-system/`
- Logs: `~/Library/Logs/pos-system/`
- Database: `~/Library/Application Support/pos-system/database.sqlite`

**Linux**:
- Data: `~/.config/pos-system/`
- Logs: `~/.config/pos-system/logs/`
- Database: `~/.config/pos-system/database.sqlite`

## Customization

### Adding Application Icons

1. Create icons (see `build/README.md`):
   - `build/icon.icns` (macOS)
   - `build/icon.ico` (Windows)
   - `build/icon.png` (Linux)

2. Update `package.json` build config (optional - icons will be used if present)

3. Rebuild

### Code Signing (Optional)

**macOS**:
- Requires Apple Developer account
- Configure in `package.json` build.mac.identity

**Windows**:
- Requires code signing certificate
- Configure in `package.json` build.win.certificateFile

## Backend Server (Optional)

The POS System works completely offline. The backend server is optional and used for:

- Cloud data sync
- Multi-device synchronization
- Remote backup

### Options for Backend

1. **No Backend** (Offline Only):
   - App works completely offline
   - No cloud sync
   - All data stored locally

2. **Local Backend** (Included in Distribution):
   - Backend server included in app
   - Customers can run locally
   - Requires MongoDB installation

3. **Cloud Backend** (Recommended):
   - Deploy backend to cloud (Heroku, AWS, etc.)
   - Configure app to use cloud backend
   - No local MongoDB needed

### Configuring Cloud Backend

1. **Deploy backend** to cloud service
2. **Update app** to use cloud backend URL
3. **Configure MongoDB** (MongoDB Atlas recommended)
4. **Test sync** functionality

## Distribution Methods

### Method 1: Direct Download

1. Host installers on your website
2. Provide download links to customers
3. Include installation instructions

### Method 2: Cloud Storage

1. Upload to Google Drive, Dropbox, etc.
2. Share download links
3. Customers download and install

### Method 3: Physical Media

1. Copy installers to USB drives
2. Distribute to customers
3. Include installation instructions

### Method 4: Auto-Updater (Advanced)

1. Set up update server
2. Configure electron-updater
3. App checks for updates automatically
4. Customers get updates automatically

## Customer Support

### Installation Support

Provide customers with:
- Installation instructions (see `INSTALLATION_GUIDE.md`)
- System requirements
- Troubleshooting guide
- Support contact information

### Common Issues

1. **Security warnings** (Windows/macOS):
   - Normal for unsigned apps
   - Instructions to bypass

2. **Installation fails**:
   - Check system requirements
   - Check disk space
   - Run as administrator (Windows)

3. **App won't start**:
   - Check logs
   - Reinstall application
   - Check system permissions

## Version Management

### Updating the Application

1. **Update version** in `package.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **Rebuild installers**:
   ```bash
   npm run build
   ```

3. **Distribute new version**:
   - Provide update instructions
   - Or use auto-updater

### Version History

Keep track of:
- Version numbers
- Changes in each version
- Compatibility notes
- Installation requirements

## Checklist

Before distributing:

- [ ] Build frontend: `npm run build:react`
- [ ] Test application locally
- [ ] Create installers: `npm run build`
- [ ] Test installers on clean systems
- [ ] Test all functionality
- [ ] Create installation instructions
- [ ] Create user documentation
- [ ] Set up support channel
- [ ] Test offline functionality
- [ ] Test online sync (if applicable)
- [ ] Prepare distribution method
- [ ] Create download links
- [ ] Test customer installation process

## Next Steps

1. **Build installers** for your target platforms
2. **Test thoroughly** on clean systems
3. **Create documentation** for customers
4. **Set up distribution** method
5. **Provide support** for customers

## Additional Resources

- **Quick Build Guide**: `QUICK_BUILD.md`
- **Distribution Guide**: `DISTRIBUTION.md`
- **Installation Guide**: `INSTALLATION_GUIDE.md`
- **Build Assets**: `build/README.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`

## Support

For issues or questions:
- Check documentation
- Review troubleshooting guide
- Test on clean systems
- Contact support team

---

**Ready to build?** Start with `QUICK_BUILD.md` for a quick start guide.

**Ready to distribute?** See `DISTRIBUTION.md` for detailed distribution instructions.

**Need help?** See `TROUBLESHOOTING.md` for common issues and solutions.

