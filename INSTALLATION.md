# Installation Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas account)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

Run the following command from the root directory:

```bash
npm run install:all
```

This will install dependencies for:
- Root project (Electron)
- Frontend (React)
- Backend (Node.js)

### 2. Configure Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and set your MongoDB connection string:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/pos-system
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pos-system
```

### 3. Start MongoDB

If using local MongoDB, make sure it's running:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Run Development Server

From the root directory, run:
```bash
npm run dev
```

This will start:
- React frontend on http://localhost:5173
- Node.js backend on http://localhost:3000
- Electron app

### 5. Build for Production

To build the application:

```bash
# Build React app
npm run build:react

# Build Electron app (creates installers)
npm run build:electron
```

The built files will be in the `dist` folder:
- Windows: `.exe` installer
- macOS: `.dmg` file
- Linux: `.AppImage`

## Troubleshooting

### Database Connection Issues

If you encounter MongoDB connection errors:
1. Verify MongoDB is running
2. Check the connection string in `.env`
3. For MongoDB Atlas, ensure your IP is whitelisted

### Electron Build Issues

If electron-builder fails:
1. Ensure all dependencies are installed
2. Check Node.js version (v18+)
3. Clear node_modules and reinstall:
```bash
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

### Sync Issues

If data is not syncing:
1. Check internet connection
2. Verify API URL in Settings
3. Check backend server is running
4. Review browser console for errors

## Project Structure

```
pos-system/
├── electron/          # Electron main process
├── frontend/         # React application
├── backend/          # Node.js API server
└── package.json      # Root package.json
```

## Next Steps

1. Add products in the Products section
2. Add customers in the Customers section
3. Start processing sales in the Billing section
4. View reports in the Reports section
5. Configure sync settings in Settings

## Support

For issues or questions, please check the README.md file or create an issue in the repository.

