import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Kitchen from './pages/Kitchen';
import Bar from './pages/Bar';
import Waiter from './pages/Waiter';
import Tables from './pages/Tables';
import Reservations from './pages/Reservations';
import Recipes from './pages/Recipes';
import Inventory from './pages/Inventory';
import './index.css';

// Custom Ant Design theme
const theme = {
  token: {
    colorPrimary: '#1890ff', // Ant Design default blue
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    colorText: '#1a1a1a',
    colorTextSecondary: '#666666',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#d9d9d9',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.15)',
    wireframe: false,
  },
  components: {
    Layout: {
      bodyBg: '#f5f7fa',
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e6f2ff',
      itemHoverBg: '#f0f5ff',
      itemSelectedColor: '#1890ff',
      itemColor: '#1a1a1a',
      itemMarginInline: 8,
      itemBorderRadius: 6,
      subMenuItemBg: 'transparent',
      itemActiveBg: '#e6f2ff',
    },
    Card: {
      borderRadius: 12,
      paddingLG: 24,
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      headerBg: '#fafbfc',
      padding: 24,
    },
    Button: {
      borderRadius: 8,
      fontWeight: 500,
      paddingInline: 20,
      paddingBlock: 8,
    },
    Input: {
      borderRadius: 8,
      paddingBlock: 10,
      paddingInline: 12,
    },
    Table: {
      borderRadius: 8,
      headerBg: '#fafbfc',
      headerColor: '#1a1a1a',
    },
    Modal: {
      borderRadius: 12,
      paddingContentHorizontal: 24,
      paddingContentVertical: 24,
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
    },
  },
};

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <AntApp>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="billing" element={<Billing />} />
                <Route path="products" element={<Products />} />
                <Route path="customers" element={<Customers />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="kitchen" element={<Kitchen />} />
                <Route path="bar" element={<Bar />} />
                <Route path="waiter" element={<Waiter />} />
                <Route path="tables" element={<Tables />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="recipes" element={<Recipes />} />
                <Route path="inventory" element={<Inventory />} />
              </Route>
            </Routes>
          </Router>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;

