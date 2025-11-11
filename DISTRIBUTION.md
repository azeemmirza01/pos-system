# Distribution Guide - POS System

This guide explains how to build and distribute the POS System to customer computers.

## Prerequisites

Before building, ensure you have:

1. **Node.js** (v18 or higher) installed
2. **All dependencies** installed: `npm run install:all`
3. **Frontend built**: The React app must be built before packaging
4. **Backend configured**: MongoDB connection string (optional, for cloud sync)

## Building for Distribution

### 1. Build the Frontend

First, build the React frontend:

```bash
cd frontend
npm run build
cd ..
```

This creates optimized production files in `frontend/dist/`.

### 2. Build Installers

Build installers for your target platform(s):

#### For macOS:
```bash
npm run build:mac
```

Creates a `.dmg` file in the `dist` folder.

#### For Windows:
```bash
npm run build:win
```

Creates a `.exe` installer in the `dist` folder.

#### For Linux:
```bash
npm run build:linux
```

Creates an `.AppImage` and `.deb` file in the `dist` folder.

#### Build for All Platforms (on macOS):
```bash
npm run build:all
```

**Note**: You can only build Windows installers on Windows, and Linux installers on Linux. macOS can build for all platforms.

### 3. Build Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "build:mac": "npm run build:react && electron-builder --mac",
    "build:win": "npm run build:react && electron-builder --win",
    "build:linux": "npm run build:react && electron-builder --linux",
    "build:all": "npm run build:react && electron-builder --mac --win --linux"
  }
}
```

## Installation Files Created

After building, you'll find installers in the `dist/` folder:

### macOS
- `POS System-1.0.0.dmg` - Drag-and-drop installer
- `POS System-1.0.0-mac.zip` - Direct app bundle

### Windows
- `POS System Setup 1.0.0.exe` - NSIS installer
- `POS System-1.0.0-win.zip` - Portable version

### Linux
- `POS System-1.0.0.AppImage` - Portable AppImage
- `pos-system_1.0.0_amd64.deb` - Debian package

## Customer Installation Instructions

### For macOS Users

1. Download the `.dmg` file
2. Double-click to open the disk image
3. Drag "POS System" to the Applications folder
4. Open Applications and double-click "POS System"
5. If you see a security warning:
   - Go to System Settings > Privacy & Security
   - Click "Open Anyway" next to the security message
   - Alternatively: Right-click the app > Open > Open

### For Windows Users

1. Download the `.exe` installer
2. Double-click the installer file
3. Follow the installation wizard:
   - Choose installation directory (default: `C:\Program Files\POS System`)
   - Select if you want desktop shortcut
   - Click "Install"
4. Launch "POS System" from the Start menu or desktop shortcut
5. If Windows Defender shows a warning:
   - Click "More info"
   - Click "Run anyway"
   - (This is normal for unsigned apps)

### For Linux Users

#### Using AppImage:
1. Download the `.AppImage` file
2. Make it executable:
   ```bash
   chmod +x POS\ System-1.0.0.AppImage
   ```
3. Double-click to run, or run from terminal:
   ```bash
   ./POS\ System-1.0.0.AppImage
   ```

#### Using DEB package:
1. Download the `.deb` file
2. Install using:
   ```bash
   sudo dpkg -i pos-system_1.0.0_amd64.deb
   ```
3. Launch from applications menu

## Application Icons

### Creating Icons

You need to create application icons for each platform:

1. **Create icon files**:
   - `build/icon.icns` (macOS) - 512x512px
   - `build/icon.ico` (Windows) - 256x256px with multiple sizes
   - `build/icon.png` (Linux) - 512x512px

2. **Icon creation tools**:
   - **macOS**: Use `iconutil` or online converters
   - **Windows**: Use online ICO converters
   - **Linux**: Use GIMP or ImageMagick

3. **Place icons** in the `build/` folder before building

### Quick Icon Setup

If you don't have custom icons, the app will use default Electron icons. To add custom icons:

1. Create a `build` folder in the project root
2. Add your icon files:
   - `build/icon.icns` (macOS)
   - `build/icon.ico` (Windows)
   - `build/icon.png` (Linux)
3. Rebuild the application

## Code Signing (Optional but Recommended)

### macOS Code Signing

For distribution outside the Mac App Store, you need:

1. **Apple Developer Account** ($99/year)
2. **Developer ID Application Certificate**
3. Update `package.json`:

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)"
    }
  }
}
```

### Windows Code Signing

For Windows, you need:

1. **Code Signing Certificate** (from certificate authority)
2. Update `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "password"
    }
  }
}
```

## Auto-Updater (Optional)

The app includes `electron-updater` for automatic updates. To enable:

1. Host your installers on a web server
2. Configure update server URL in `electron/main.js`
3. Set up update endpoints

## Backend Server Setup (Optional)

The POS system works completely offline. However, if customers want cloud sync:

### Option 1: Local Backend (Bundled)

The backend server is included in the distribution. Customers can run it locally:

1. The backend server is in the app's resources
2. It can be started automatically or manually
3. Requires MongoDB installed locally or remote connection

### Option 2: Cloud Backend (Recommended)

Deploy the backend server to a cloud service:

1. **Deploy backend** to:
   - Heroku
   - AWS
   - DigitalOcean
   - Azure
   - Any Node.js hosting service

2. **Configure MongoDB**:
   - MongoDB Atlas (free tier available)
   - Or self-hosted MongoDB

3. **Update frontend** to point to cloud backend URL

4. **Environment variables**:
   - Set `REACT_APP_API_URL` in frontend
   - Or configure in app settings

## Distribution Checklist

Before distributing to customers:

- [ ] Build frontend: `npm run build:react`
- [ ] Test the built app locally
- [ ] Create application icons
- [ ] Build installers for target platforms
- [ ] Test installation on clean systems
- [ ] Test app functionality after installation
- [ ] Create user documentation
- [ ] Set up update server (if using auto-updater)
- [ ] Configure code signing (if distributing publicly)
- [ ] Test offline functionality
- [ ] Test online sync functionality

## Troubleshooting Installation

### macOS Issues

**"App is damaged" error**:
```bash
xattr -cr /Applications/POS\ System.app
```

**Gatekeeper blocking**:
- System Settings > Privacy & Security > Allow app

### Windows Issues

**Windows Defender warning**:
- This is normal for unsigned apps
- Click "More info" > "Run anyway"
- Add exception in Windows Defender

**Installation fails**:
- Run installer as Administrator
- Check disk space (requires ~200MB)
- Disable antivirus temporarily

### Linux Issues

**AppImage won't run**:
```bash
chmod +x POS\ System-1.0.0.AppImage
./POS\ System-1.0.0.AppImage
```

**Missing dependencies**:
```bash
sudo apt-get install libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
```

## File Sizes

Expected installer sizes:

- **macOS DMG**: ~150-200 MB
- **Windows EXE**: ~150-200 MB
- **Linux AppImage**: ~150-200 MB

The installed application uses:
- **Disk space**: ~200-300 MB
- **RAM**: ~200-500 MB (when running)

## Support

For customer support:

1. **Logs location**:
   - macOS: `~/Library/Logs/pos-system/`
   - Windows: `%APPDATA%\pos-system\logs\`
   - Linux: `~/.config/pos-system/logs/`

2. **Data location**:
   - macOS: `~/Library/Application Support/pos-system/`
   - Windows: `%APPDATA%\pos-system\`
   - Linux: `~/.config/pos-system/`

3. **Database file**: `database.sqlite` in data directory

## Next Steps

1. **Create installers** for your target platforms
2. **Test installations** on clean systems
3. **Distribute** to customers via:
   - Download link
   - USB drives
   - CD/DVD
   - Cloud storage (Google Drive, Dropbox, etc.)
4. **Provide installation instructions** to customers
5. **Set up support** channel for customer issues

## Advanced: Creating Custom Installers

For custom branding and installation experience:

1. **Custom installer scripts**: Edit `build/installer.nsh` (Windows)
2. **Custom DMG background**: Create custom DMG with background image
3. **License agreement**: Add EULA to installer
4. **Custom install locations**: Configure in `package.json`

## Questions?

For issues or questions about distribution:
- Check `TROUBLESHOOTING.md`
- Review electron-builder documentation
- Test on clean virtual machines

