import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Space,
  Table,
} from 'antd';
import {
  MoneyCollectOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import db from '../services/database';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import type { Sale } from '../types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs(subDays(new Date(), 7)),
    dayjs(new Date()),
  ]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    loadSales();
  }, [dateRange]);

  const loadSales = async () => {
    try {
      const allSales = (await db.getSales(10000)) as Sale[];
      const filtered = allSales.filter((sale) => {
        if (!sale.created_at) return false;
        const saleDate = new Date(sale.created_at);
        const start = startOfDay(dateRange[0].toDate());
        const end = endOfDay(dateRange[1].toDate());
        return saleDate >= start && saleDate <= end;
      });
      setSales(filtered);

      const totalRevenue = filtered.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      const totalTransactions = filtered.length;
      const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      const today = startOfDay(new Date());
      const todaySales = allSales.filter((sale) => {
        if (!sale.created_at) return false;
        const saleDate = new Date(sale.created_at);
        return saleDate >= today;
      });
      const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

      setStats({
        totalRevenue,
        totalTransactions,
        averageTransaction,
        todayRevenue,
      });
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const topProducts = sales
    .flatMap((sale) => sale.items || [])
    .reduce((acc: any, item: any) => {
      const existing = acc.find((p: any) => p.product_id === item.product_id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.total += item.total;
      } else {
        acc.push({
          product_id: item.product_id,
          product_name: item.product_name || 'Unknown',
          quantity: item.quantity,
          total: item.total,
        });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 10);

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Quantity Sold',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total Revenue',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ${total.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{ marginBottom: 16, borderRadius: 6 }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={2} style={{ margin: 0 }}>
            Reports
          </Title>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0]!, dates[1]!]);
              }
            }}
            format="YYYY-MM-DD"
            size="large"
          />
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 6 }}>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <MoneyCollectOutlined style={{ fontSize: 32, color: '#3f8600' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 6 }}>
            <Statistic
              title="Total Transactions"
              value={stats.totalTransactions}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <ShoppingCartOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 6 }}>
            <Statistic
              title="Average Transaction"
              value={stats.averageTransaction}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <RiseOutlined style={{ fontSize: 32, color: '#722ed1' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 6 }}>
            <Statistic
              title="Today Revenue"
              value={stats.todayRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <CalendarOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Top Products" style={{ borderRadius: 6 }}>
        <Table
          dataSource={topProducts}
          columns={columns}
          rowKey="product_id"
          pagination={false}
        />
      </Card>
    </div>
  );
}

