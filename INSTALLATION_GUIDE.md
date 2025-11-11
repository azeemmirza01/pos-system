# Installation Guide for Customers

This guide is for customers installing the POS System on their computers.

## System Requirements

### Minimum Requirements

- **Operating System**:
  - Windows 10 or later (64-bit)
  - macOS 10.13 (High Sierra) or later
  - Linux (Ubuntu 18.04+, Debian 10+, or equivalent)
  
- **Hardware**:
  - 2 GB RAM (4 GB recommended)
  - 500 MB free disk space
  - Internet connection (optional, for cloud sync)

## Installation Instructions

### Windows Installation

1. **Download the installer**:
   - Download `POS System Setup 1.0.0.exe` from the provided link

2. **Run the installer**:
   - Double-click the downloaded `.exe` file
   - If Windows Defender shows a warning:
     - Click "More info"
     - Click "Run anyway"
     - (This is normal for software that isn't code-signed)

3. **Follow the installation wizard**:
   - Click "Next" to begin
   - Choose installation location (default: `C:\Program Files\POS System`)
   - Select additional options:
     - Create desktop shortcut (recommended)
     - Create start menu shortcut (recommended)
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

4. **Launch the application**:
   - Double-click the desktop shortcut, or
   - Search for "POS System" in the Start menu and click it

5. **First launch**:
   - The application will create a local database
   - You can start using it immediately
   - No internet connection required for basic operation

### macOS Installation

1. **Download the installer**:
   - Download `POS System-1.0.0.dmg` from the provided link

2. **Open the disk image**:
   - Double-click the downloaded `.dmg` file
   - A window will open showing the POS System app

3. **Install the application**:
   - Drag "POS System" to the "Applications" folder
   - Wait for the copy to complete
   - Eject the disk image (drag to Trash or press Cmd+E)

4. **Launch the application**:
   - Open the Applications folder
   - Double-click "POS System"
   - If you see a security warning:
     - Go to System Settings > Privacy & Security
     - Scroll down to find the security message
     - Click "Open Anyway"
     - Or: Right-click the app > Open > Open

5. **First launch**:
   - The application will create a local database
   - You can start using it immediately
   - No internet connection required for basic operation

### Linux Installation

#### Option 1: AppImage (Recommended - Portable)

1. **Download the AppImage**:
   - Download `POS System-1.0.0.AppImage` from the provided link

2. **Make it executable**:
   ```bash
   chmod +x POS\ System-1.0.0.AppImage
   ```

3. **Run the application**:
   - Double-click the AppImage file, or
   - Run from terminal:
     ```bash
     ./POS\ System-1.0.0.AppImage
     ```

4. **Optional: Make it available system-wide**:
   - Move the AppImage to `/opt/` or `~/Applications/`
   - Create a desktop file for easy access

#### Option 2: DEB Package (Ubuntu/Debian)

1. **Download the DEB package**:
   - Download `pos-system_1.0.0_amd64.deb` from the provided link

2. **Install using terminal**:
   ```bash
   sudo dpkg -i pos-system_1.0.0_amd64.deb
   ```

3. **Fix dependencies (if needed)**:
   ```bash
   sudo apt-get install -f
   ```

4. **Launch the application**:
   - Search for "POS System" in applications menu
   - Or run from terminal: `pos-system`

## First-Time Setup

### 1. Application Initialization

When you first launch the POS System:

1. The application will create a local database automatically
2. No configuration is required to start using it
3. All data is stored locally on your computer

### 2. Adding Products

1. Click on "Products" in the sidebar
2. Click "Add Product"
3. Fill in product details:
   - Name
   - Price
   - Stock quantity
   - Category (optional)
   - Barcode (optional)
   - Image (optional)
4. Click "Save"

### 3. Setting Up Customers (Optional)

1. Click on "Customers" in the sidebar
2. Click "Add Customer"
3. Fill in customer information
4. Click "Save"

### 4. Processing Sales

1. Click on "Billing" in the sidebar
2. Search for products or scan barcodes
3. Click products to add them to the cart
4. Adjust quantities if needed
5. Select customer (optional)
6. Apply discount (optional)
7. Click "Checkout"

## Cloud Sync Setup (Optional)

If you want to sync data to the cloud:

### Prerequisites

- Internet connection
- Backend server URL (provided by your administrator)
- MongoDB connection (if using local backend)

### Configuration

1. **Automatic Sync** (if backend is configured):
   - The app automatically syncs when online
   - No configuration needed

2. **Manual Configuration** (if needed):
   - Go to Settings
   - Enter backend server URL
   - Enable auto-sync
   - Click "Save"

### How Sync Works

- **Offline Mode**: All transactions are stored locally
- **Online Mode**: Data automatically syncs to cloud
- **Automatic**: Sync happens in the background
- **No Data Loss**: Local data is always preserved

## Troubleshooting

### Application Won't Start

**Windows**:
- Run as Administrator
- Check if antivirus is blocking it
- Reinstall the application

**macOS**:
- Check System Settings > Privacy & Security
- Allow the application in Security settings
- Try: `xattr -cr /Applications/POS\ System.app`

**Linux**:
- Check file permissions: `chmod +x POS\ System-1.0.0.AppImage`
- Install dependencies:
  ```bash
  sudo apt-get install libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
  ```

### Database Issues

- **Database corrupted**: Delete the database file and restart
  - Location: `%APPDATA%\pos-system\database.sqlite` (Windows)
  - Location: `~/Library/Application Support/pos-system/database.sqlite` (macOS)
  - Location: `~/.config/pos-system/database.sqlite` (Linux)

### Performance Issues

- **Slow performance**: 
  - Close other applications
  - Restart the POS System
  - Check available disk space
  - Clear old data if needed

### Image Upload Issues

- **Images not showing**:
  - Check file permissions
  - Ensure images are in supported formats (JPG, PNG, GIF)
  - Try re-uploading the image

## Uninstallation

### Windows

1. Go to Settings > Apps > Apps & features
2. Find "POS System"
3. Click "Uninstall"
4. Follow the uninstallation wizard

**Or**:
1. Go to Control Panel > Programs > Uninstall a program
2. Find "POS System"
3. Click "Uninstall"

### macOS

1. Open Applications folder
2. Drag "POS System" to Trash
3. Empty Trash

**To remove all data**:
1. Delete: `~/Library/Application Support/pos-system/`
2. Delete: `~/Library/Logs/pos-system/`

### Linux

**AppImage**:
- Delete the AppImage file

**DEB Package**:
```bash
sudo apt-get remove pos-system
```

**To remove all data**:
- Delete: `~/.config/pos-system/`

## Data Backup

### Manual Backup

1. **Locate data directory**:
   - Windows: `%APPDATA%\pos-system\`
   - macOS: `~/Library/Application Support/pos-system/`
   - Linux: `~/.config/pos-system/`

2. **Copy the entire folder** to a backup location
3. **Database file**: `database.sqlite`
4. **Images**: `images/` folder

### Restore Backup

1. Close the POS System application
2. Copy backed-up files to the data directory
3. Replace existing files
4. Restart the application

## Support

### Getting Help

If you encounter issues:

1. **Check the logs**:
   - Location: Data directory > `logs/` folder
   - Look for error messages

2. **Contact support**:
   - Provide error messages from logs
   - Describe the issue in detail
   - Include screenshots if possible

### Log Locations

- **Windows**: `%APPDATA%\pos-system\logs\`
- **macOS**: `~/Library/Logs/pos-system/`
- **Linux**: `~/.config/pos-system/logs/`

## Frequently Asked Questions

### Q: Do I need internet to use the POS System?
**A**: No, the POS System works completely offline. Internet is only needed for cloud sync (optional).

### Q: Where is my data stored?
**A**: All data is stored locally on your computer in the application data directory.

### Q: Can I use it on multiple computers?
**A**: Yes, but you'll need to set up cloud sync or manually transfer the database file.

### Q: How do I update the application?
**A**: Download and install the new version. Your data will be preserved.

### Q: Is my data safe?
**A**: Yes, all data is stored locally. If you use cloud sync, data is also backed up to the cloud.

### Q: Can I print receipts?
**A**: Receipt printing is available. Configure your printer in Settings.

### Q: How many products can I add?
**A**: There's no limit. The system can handle thousands of products.

### Q: Can I export my data?
**A**: Yes, you can export data to CSV or JSON from the Reports section.

## Next Steps

1. **Add your products** to the system
2. **Set up customers** (optional)
3. **Start processing sales**
4. **Configure cloud sync** (if needed)
5. **Set up receipt printing** (if needed)
6. **Train your staff** on using the system

## Additional Resources

- **User Manual**: See `USER_MANUAL.md` (if provided)
- **Video Tutorials**: Check support website (if available)
- **Support Email**: [Your support email]
- **Support Website**: [Your support website]

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Support**: [Your contact information]

