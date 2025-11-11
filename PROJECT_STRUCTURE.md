# Project Structure

## Directory Layout

```
pos-system/
├── electron/                 # Electron main process
│   ├── main.js              # Main Electron process file
│   ├── preload.js           # Preload script for IPC
│   └── database.js          # SQLite database wrapper
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   └── Layout.jsx   # Main layout component
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Billing.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/        # Service layers
│   │   │   ├── database.js  # Database service
│   │   │   └── sync.js      # Sync service
│   │   ├── stores/          # Zustand stores
│   │   │   └── usePosStore.js
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/                 # Node.js API server
│   ├── models/              # MongoDB models
│   │   ├── Product.js
│   │   ├── Customer.js
│   │   ├── Sale.js
│   │   ├── SaleItem.js
│   │   └── User.js
│   ├── routes/              # API routes
│   │   ├── products.js
│   │   ├── customers.js
│   │   ├── sales.js
│   │   ├── saleItems.js
│   │   └── users.js
│   ├── server.js            # Express server
│   ├── package.json
│   └── .env.example
├── package.json             # Root package.json
├── README.md
├── INSTALLATION.md
├── QUICKSTART.md
└── .gitignore
```

## Key Components

### Electron Layer
- **main.js**: Main process that handles window creation and IPC
- **preload.js**: Bridge between renderer and main process
- **database.js**: SQLite database wrapper using better-sqlite3

### Frontend Layer
- **React + Vite**: Fast development and building
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing

### Backend Layer
- **Express**: Web server framework
- **MongoDB + Mongoose**: Cloud database and ODM
- **RESTful API**: Standard HTTP endpoints

### Database Layer
- **SQLite (Local)**: Offline-first database
- **MongoDB (Cloud)**: Cloud backup and sync

## Data Flow

1. **User Action** → React Component
2. **State Update** → Zustand Store
3. **Database Operation** → Database Service
4. **IPC Call** → Electron Main Process
5. **SQLite Query** → Local Database
6. **Sync Queue** → Added for offline operations
7. **Auto Sync** → Sync Service (when online)
8. **API Call** → Backend Server
9. **MongoDB** → Cloud Storage

## Sync Mechanism

1. All local operations are stored in SQLite
2. Operations are queued in `sync_queue` table
3. Sync service monitors online status
4. When online, sync service processes queue
5. Data is sent to backend API
6. Backend stores in MongoDB
7. Queue items are marked as synced

## Key Features

- ✅ Offline-first architecture
- ✅ Automatic sync when online
- ✅ Real-time online/offline status
- ✅ Product management
- ✅ Customer management
- ✅ Sales/Invoice processing
- ✅ Reports and analytics
- ✅ Multi-platform support

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Desktop | Electron | Native app shell |
| Frontend | React | UI framework |
| State | Zustand | State management |
| Styling | Tailwind CSS | CSS framework |
| Local DB | SQLite | Offline storage |
| Backend | Node.js + Express | API server |
| Cloud DB | MongoDB | Cloud storage |
| Build | Vite | Frontend build tool |
| Package | electron-builder | App packaging |

## Development Workflow

1. **Development**: `npm run dev` (starts all services)
2. **Frontend Only**: `npm run dev:react`
3. **Backend Only**: `npm run dev:server`
4. **Build**: `npm run build`
5. **Package**: `npm run build:electron`

## Production Deployment

1. Build React app: `npm run build:react`
2. Package Electron app: `npm run build:electron`
3. Distribute installer from `dist/` folder
4. Deploy backend to cloud (optional)
5. Configure API URL in app settings

## Environment Variables

### Frontend (.env)
- `VITE_API_URL`: Backend API URL

### Backend (.env)
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string

