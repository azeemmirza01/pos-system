import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useEffect, useState } from 'react';
import usePosStore from '../stores/usePosStore';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/billing', icon: ShoppingCart, label: 'Billing' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/invoices', icon: FileText, label: 'Invoices' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const location = useLocation();
  const { isOnline, initialize } = usePosStore();
  // Load sidebar state from localStorage, default to true
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    initialize().catch(error => {
      console.error('Failed to initialize app:', error);
    });
  }, [initialize]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Save to localStorage
    localStorage.setItem('sidebarOpen', newState.toString());
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed left-2 top-2 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Expanded Sidebar */}
      {sidebarOpen && (
        <aside className="fixed lg:static w-64 bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out z-40 h-full">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary-600">POS System</h1>
              <div className="flex items-center gap-2 mt-2">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600">Offline</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          <nav className="flex-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Collapse Button for Desktop */}
          <div className="p-4 border-t hidden lg:block">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </button>
          </div>
        </aside>
      )}

      {/* Collapsed Sidebar (Desktop only when sidebar is closed) */}
      {!sidebarOpen && (
        <aside className="hidden lg:flex lg:flex-col w-16 bg-white shadow-lg border-r">
          <div className="p-4 border-b flex items-center justify-center">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
          </div>
          <nav className="flex-1 p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-center p-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>
          <div className="p-2 border-t">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

