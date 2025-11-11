# Offline-First POS System

A professional Point of Sale system built with Electron, React, and Node.js that works offline and automatically syncs when online.

## Features

- ✅ Works completely offline
- ✅ Automatic cloud sync when internet returns
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Product management
- ✅ Customer management
- ✅ Sales/Invoice generation
- ✅ Receipt printing (ready for integration)
- ✅ Multi-user support
- ✅ Local SQLite database
- ✅ Cloud MongoDB backup

## Tech Stack

- **Desktop Shell**: Electron.js
- **Frontend**: React + Zustand + Tailwind CSS
- **Local Database**: SQLite (better-sqlite3)
- **Backend**: Node.js + Express
- **Cloud Database**: MongoDB
- **Packaging**: electron-builder

## Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. Run in development mode:
```bash
npm run dev
```

## Building for Production

### Quick Build

```bash
# Build for your current platform
npm run build

# Build for specific platform
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
npm run build:all    # All platforms (macOS only)
```

This will create installers in the `dist` folder:
- **Windows**: `.exe` installer (NSIS)
- **macOS**: `.dmg` file
- **Linux**: `.AppImage` and `.deb` package

### Distribution

See `DISTRIBUTION.md` for detailed distribution instructions.

### Customer Installation

See `INSTALLATION_GUIDE.md` for customer installation instructions.

## Project Structure

```
pos-system/
├── electron/          # Electron main process
│   ├── main.js       # Main Electron process
│   ├── preload.js    # Preload script
│   └── database.js   # SQLite database wrapper
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── backend/          # Node.js API server
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── server.js
└── package.json      # Root package.json
```

## Usage

1. **Start the application**: Run `npm run dev` to start all services
2. **Add Products**: Navigate to Products section and add items
3. **Process Sales**: Use the Billing screen to create invoices
4. **View Reports**: Check the Reports section for sales analytics
5. **Sync Data**: Data automatically syncs when online

## Sync Mechanism

The system automatically:
- Queues all offline transactions in SQLite
- Monitors internet connection
- Syncs data to MongoDB when online
- Marks synced records to avoid duplicates

## License

MIT

