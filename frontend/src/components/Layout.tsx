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
  GlobalOutlined,
} from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { MenuProps } from 'antd';

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
    key: '/products',
    icon: <ShopOutlined />,
    label: 'Products',
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
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline, initialize, cart } = usePosStore();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    initialize().catch((error) => {
      console.error('Failed to initialize app:', error);
    });
  }, [initialize]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

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
            color: '#000000d9',
            padding: collapsed ? 0 : '0 16px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {!collapsed && (
            <Title level={4} style={{ color: '#000000d9', margin: 0 }}>
              POS System
            </Title>
          )}
          {collapsed && (
            <Title level={4} style={{ color: '#000000d9', margin: 0 }}>
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
            padding: '12px',
            background: '#f0f0f0',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Badge
            status={isOnline ? 'success' : 'error'}
            text={collapsed ? '' : (isOnline ? 'Online' : 'Offline')}
            style={{ color: '#000000d9' }}
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
          }}
        >
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
          <Space>
            <Badge count={cart.length} size="small">
              <Button
                type="text"
                icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
                onClick={() => navigate('/billing')}
              />
            </Badge>
            <Space>
              <GlobalOutlined
                style={{
                  color: isOnline ? '#52c41a' : '#ff4d4f',
                  fontSize: 16,
                }}
              />
              <span style={{ fontSize: 14, color: '#666' }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </Space>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 6,
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

