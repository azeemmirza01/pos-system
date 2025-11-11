# Quick Start Guide

## Prerequisites
- Node.js v18 or higher
- MongoDB (local or MongoDB Atlas)

## Installation Steps

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Setup MongoDB
- **Local MongoDB**: Make sure MongoDB is running on your machine
- **MongoDB Atlas**: Create a free cluster and get your connection string

### 3. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### 4. Start Development Server
```bash
# From root directory
npm run dev
```

This will start:
- React frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Electron app (opens automatically)

## First Steps

1. **Add Products**: Go to Products section and add some items
2. **Add Customers**: Go to Customers section (optional)
3. **Process Sale**: Go to Billing section and create a sale
4. **View Reports**: Check the Reports section for analytics

## Building for Production

```bash
npm run build
```

The built application will be in the `dist` folder.

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running (if local)
- Check connection string in `backend/.env`
- For Atlas, ensure your IP is whitelisted

### Electron Not Opening
- Make sure React dev server is running on port 5173
- Check console for errors
- Try running `npm run dev:react` separately first

### Sync Not Working
- Check internet connection
- Verify backend is running
- Check API URL in Settings
- Review browser console for errors

## Features

✅ Offline-first operation
✅ Automatic cloud sync
✅ Product management
✅ Customer management
✅ Sales/Invoice generation
✅ Reports and analytics
✅ Multi-platform support

## Need Help?

Check the README.md and INSTALLATION.md for more details.

