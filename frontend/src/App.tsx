import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './index.css';

// Custom Ant Design theme - Vectron Systems exact design
const theme = {
  token: {
    colorPrimary: '#0052a3', // Vectron's primary blue
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
      itemSelectedColor: '#0052a3',
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
    <ConfigProvider theme={theme}>
      <Router>
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
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;

