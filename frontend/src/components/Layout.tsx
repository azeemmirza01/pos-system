import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout as AntLayout,
  Menu,
  Badge,
  Typography,
  Space,
  Button,
  theme,
  Select,
  Spin,
} from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  TeamOutlined,
  FileTextOutlined,
  FundOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WifiOutlined,
  CoffeeOutlined,
  FireOutlined,
  UserOutlined,
  TableOutlined,
  CalendarOutlined,
  BookOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { MenuProps } from 'antd';
import { type Currency } from '../utils/currency';

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/billing',
    icon: <ShoppingCartOutlined />,
    label: 'Billing',
  },
  {
    type: 'divider',
  },
  {
    key: '/kitchen',
    icon: <FireOutlined />,
    label: 'Kitchen',
  },
  {
    key: '/bar',
    icon: <CoffeeOutlined />,
    label: 'Bar',
  },
  {
    key: '/waiter',
    icon: <UserOutlined />,
    label: 'Waiter',
  },
  {
    type: 'divider',
  },
  {
    key: '/tables',
    icon: <TableOutlined />,
    label: 'Tables',
  },
  {
    key: '/reservations',
    icon: <CalendarOutlined />,
    label: 'Reservations',
  },
  {
    type: 'divider',
  },
  {
    key: '/products',
    icon: <ShopOutlined />,
    label: 'Products',
  },
  {
    key: '/recipes',
    icon: <BookOutlined />,
    label: 'Recipes',
  },
  {
    key: '/inventory',
    icon: <DatabaseOutlined />,
    label: 'Inventory',
  },
  {
    type: 'divider',
  },
  {
    key: '/customers',
    icon: <TeamOutlined />,
    label: 'Customers',
  },
  {
    key: '/invoices',
    icon: <FileTextOutlined />,
    label: 'Invoices',
  },
  {
    key: '/reports',
    icon: <FundOutlined />,
    label: 'Reports',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
];

export default function Layout() {
  console.log('[Layout] Component rendering...');
  
  const [collapsed, setCollapsed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hooks must be called unconditionally - wrap in try-catch at usage level
  const storeState = usePosStore();
  const { isOnline, initialize, cart, currency, setCurrency } = storeState;
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const init = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);
        await initialize();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to initialize app:', error);
        setInitError(errorMessage);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const titles: Record<string, { title: string; subtitle: string }> = {
      '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your business performance' },
      '/billing': { title: 'Billing', subtitle: 'Process sales and manage transactions' },
      '/products': { title: 'Products', subtitle: 'Manage your product catalog' },
      '/customers': { title: 'Customers', subtitle: 'Manage customer information and relationships' },
      '/invoices': { title: 'Invoices', subtitle: 'View and manage sales invoices' },
      '/reports': { title: 'Reports', subtitle: 'Analyze sales performance and business insights' },
      '/settings': { title: 'Settings', subtitle: 'Configure system settings and preferences' },
    };
    return titles[location.pathname] || { title: 'POS System', subtitle: '' };
  };

  const pageInfo = getPageTitle();

  if (isInitializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <Typography.Text type="secondary">Initializing POS System...</Typography.Text>
      </div>
    );
  }

  if (initError) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 16,
        padding: 20
      }}>
        <Typography.Title level={3}>Initialization Error</Typography.Title>
        <Typography.Text type="danger">{initError}</Typography.Text>
        <Button type="primary" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    );
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: '#0066cc',
            padding: collapsed ? 0 : '0 16px',
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          {!collapsed && (
            <Title level={4} style={{ color: '#0052a3', margin: 0, fontWeight: 600, fontSize: 18 }}>
              POS System
            </Title>
          )}
          {collapsed && (
            <Title level={4} style={{ color: '#0052a3', margin: 0, fontWeight: 600 }}>
              POS
            </Title>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            padding: '12px 16px',
            background: isOnline ? '#e6f7ff' : '#fff1f0',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
            border: `1px solid ${isOnline ? '#91d5ff' : '#ffccc7'}`,
          }}
        >
          <Badge
            status={isOnline ? 'success' : 'error'}
            text={collapsed ? '' : (isOnline ? 'Online' : 'Offline')}
            style={{ color: isOnline ? '#0052a3' : '#cf1322', fontWeight: 500 }}
          />
        </div>
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          <Space style={{ flex: 1 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <div style={{ marginLeft: collapsed ? 0 : 8 }}>
              <Title level={3} style={{ margin: 0, color: '#1a1a1a', fontWeight: 600, fontSize: 20 }}>
                {pageInfo.title}
              </Title>
              {pageInfo.subtitle && (
                <p style={{ margin: 0, color: '#666666', fontSize: 12, lineHeight: 1.2 }}>
                  {pageInfo.subtitle}
                </p>
              )}
            </div>
          </Space>
          <Space>
            <Select
              value={currency}
              onChange={(value) => setCurrency(value as Currency)}
              style={{ width: 100 }}
              size="small"
            >
              <Select.Option value="USD">$ USD</Select.Option>
              <Select.Option value="EUR">€ EUR</Select.Option>
            </Select>
            <Badge count={cart.length} size="small">
              <Button
                type="text"
                icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
                onClick={() => navigate('/billing')}
              />
            </Badge>
            <Space>
              <WifiOutlined
                style={{
                  color: isOnline ? '#52c41a' : '#ff4d4f',
                  fontSize: 18,
                }}
              />
              <span style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </Space>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 0,
            minHeight: 280,
            background: 'transparent',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

