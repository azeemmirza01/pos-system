import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Space,
  Table,
} from 'antd';
import {
  MoneyCollectOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  CalendarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import db from '../services/database';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import type { Sale } from '../types';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import usePosStore from '../stores/usePosStore';
import { getCurrencySymbol, formatCurrency } from '../utils/currency';
import axios from 'axios';
import type { Recipe } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const { RangePicker } = DatePicker;

export default function Reports() {
  const currency = usePosStore((state) => state.currency) || 'USD';
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
  const [recipeCosts, setRecipeCosts] = useState<Array<{ recipe: Recipe; cost: number }>>([]);
  const { isOnline } = usePosStore();

  useEffect(() => {
    loadSales();
    if (isOnline) {
      loadRecipeCosts();
    }
  }, [dateRange, isOnline]);

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

  const loadRecipeCosts = async () => {
    try {
      if (!isOnline) return;
      
      const recipesResponse = await axios.get(`${API_BASE_URL}/recipes`);
      const recipes = recipesResponse.data || [];
      
      const costs = await Promise.all(
        recipes.map(async (recipe: Recipe) => {
          try {
            const costResponse = await axios.get(`${API_BASE_URL}/recipes/${recipe.id}/cost`);
            return { recipe, cost: costResponse.data.total_cost || 0 };
          } catch (error) {
            console.warn(`Error loading cost for recipe ${recipe.id}:`, error);
            return { recipe, cost: 0 };
          }
        })
      );
      
      setRecipeCosts(costs.sort((a, b) => b.cost - a.cost));
    } catch (error) {
      console.error('Error loading recipe costs:', error);
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
          {formatCurrency(total, currency)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{ marginBottom: 16, borderRadius: 12 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
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
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={getCurrencySymbol(currency)}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <MoneyCollectOutlined style={{ fontSize: 32, color: '#3f8600' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
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
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Average Transaction"
              value={stats.averageTransaction}
              prefix={getCurrencySymbol(currency)}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <RiseOutlined style={{ fontSize: 32, color: '#722ed1' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Today Revenue"
              value={stats.todayRevenue}
              prefix={getCurrencySymbol(currency)}
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <CalendarOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Top Products" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Table
          dataSource={topProducts}
          columns={columns}
          rowKey="product_id"
          pagination={false}
        />
      </Card>

      {isOnline && recipeCosts.length > 0 && (
        <Card 
          title={
            <Space>
              <DollarOutlined />
              <span>Recipe Cost Analysis</span>
            </Space>
          } 
          style={{ borderRadius: 12 }}
        >
          <Table
            dataSource={recipeCosts}
            rowKey={(record) => record.recipe.id}
            pagination={false}
            columns={[
              {
                title: 'Recipe Name',
                dataIndex: ['recipe', 'name'],
                key: 'name',
              },
              {
                title: 'Product',
                key: 'product',
                render: (_: any, record: { recipe: Recipe; cost: number }) => {
                  const product = usePosStore.getState().products.find(p => p.id === record.recipe.product_id);
                  return product?.name || record.recipe.product_id;
                },
              },
              {
                title: 'Recipe Cost',
                dataIndex: 'cost',
                key: 'cost',
                render: (cost: number) => (
                  <span style={{ fontWeight: 'bold', color: '#cf1322' }}>
                    {formatCurrency(cost, currency)}
                  </span>
                ),
                sorter: (a: any, b: any) => a.cost - b.cost,
              },
              {
                title: 'Product Price',
                key: 'product_price',
                render: (_: any, record: { recipe: Recipe; cost: number }) => {
                  const product = usePosStore.getState().products.find(p => p.id === record.recipe.product_id);
                  const price = product?.price || 0;
                  return formatCurrency(price, currency);
                },
              },
              {
                title: 'Profit Margin',
                key: 'margin',
                render: (_: any, record: { recipe: Recipe; cost: number }) => {
                  const product = usePosStore.getState().products.find(p => p.id === record.recipe.product_id);
                  const price = product?.price || 0;
                  const margin = price > 0 ? ((price - record.cost) / price) * 100 : 0;
                  const marginAmount = price - record.cost;
                  return (
                    <Space direction="vertical" size="small">
                      <span style={{ fontWeight: 'bold', color: margin > 0 ? '#3f8600' : '#cf1322' }}>
                        {formatCurrency(marginAmount, currency)} ({margin.toFixed(1)}%)
                      </span>
                    </Space>
                  );
                },
                sorter: (a: any, b: any) => {
                  const productA = usePosStore.getState().products.find(p => p.id === a.recipe.product_id);
                  const productB = usePosStore.getState().products.find(p => p.id === b.recipe.product_id);
                  const marginA = productA?.price ? ((productA.price - a.cost) / productA.price) * 100 : 0;
                  const marginB = productB?.price ? ((productB.price - b.cost) / productB.price) * 100 : 0;
                  return marginA - marginB;
                },
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}

