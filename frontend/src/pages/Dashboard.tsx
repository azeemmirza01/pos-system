import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  MoneyCollectOutlined,
  ShopOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import usePosStore from '../stores/usePosStore';
import db from '../services/database';
import type { Sale } from '../types';

const { Title } = Typography;

export default function Dashboard() {
  const { products, customers } = usePosStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    salesGrowth: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const sales = (await db.getSales(1000)) as Sale[];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const todaySales = sales
        .filter(sale => {
          const saleDate = sale.created_at ? new Date(sale.created_at) : null;
          return saleDate && saleDate >= today;
        })
        .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

      // Calculate growth (simplified - compare today vs yesterday)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdaySales = sales
        .filter(sale => {
          const saleDate = sale.created_at ? new Date(sale.created_at) : null;
          return saleDate && saleDate >= yesterday && saleDate < today;
        })
        .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      
      const salesGrowth = yesterdaySales > 0 
        ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 
        : 0;

      setStats({
        totalSales,
        todaySales,
        totalProducts: products.length,
        totalCustomers: customers.length,
        salesGrowth,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Today Sales',
      value: stats.todaySales,
      prefix: '$',
      precision: 2,
      icon: <MoneyCollectOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      color: '#52c41a',
      suffix: stats.salesGrowth !== 0 && (
        <span style={{ fontSize: 14, marginLeft: 8 }}>
          {stats.salesGrowth > 0 ? (
            <RiseOutlined style={{ color: '#52c41a' }} />
          ) : (
            <FallOutlined style={{ color: '#ff4d4f' }} />
          )}
          {Math.abs(stats.salesGrowth).toFixed(1)}%
        </span>
      ),
    },
    {
      title: 'Total Sales',
      value: stats.totalSales,
      prefix: '$',
      precision: 2,
      icon: <ShoppingCartOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: <ShopOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      color: '#722ed1',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: <TeamOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      color: '#fa8c16',
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Dashboard
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `1px solid ${stat.color}20`,
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                precision={stat.precision}
                valueStyle={{ color: stat.color, fontSize: 24, fontWeight: 'bold' }}
                suffix={stat.suffix}
              />
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                {stat.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title="Quick Actions"
        style={{
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: 6,
                border: '2px solid #1890ff',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: 24 }}
              onClick={() => navigate('/billing')}
            >
              <ShoppingCartOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Title level={4} style={{ margin: 0 }}>
                New Sale
              </Title>
              <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
                Start a new transaction
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: 6,
                border: '2px solid #722ed1',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: 24 }}
              onClick={() => navigate('/products')}
            >
              <ShopOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
              <Title level={4} style={{ margin: 0 }}>
                Manage Products
              </Title>
              <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
                Add, edit, or remove products
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: 6,
                border: '2px solid #fa8c16',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: 24 }}
              onClick={() => navigate('/customers')}
            >
              <TeamOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
              <Title level={4} style={{ margin: 0 }}>
                Manage Customers
              </Title>
              <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
                View and manage customer data
              </p>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

