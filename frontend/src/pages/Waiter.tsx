import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Space, Typography, Table, Empty } from 'antd';
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Order, Table as TableType } from '../types';
import axios from 'axios';

const { Title, Text } = Typography;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Waiter() {
  const store = usePosStore();
  const { isOnline } = store;
  const tables = store.tables || [];
  const loadTables = store.loadTables;
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => {
    loadActiveOrders();
    if (loadTables) {
      loadTables().catch(console.error);
    }
    const interval = setInterval(() => {
      loadActiveOrders();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const loadActiveOrders = async () => {
    try {
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/orders?status=confirmed,preparing,ready`);
        const filtered = response.data.filter((order: Order) => 
          order.order_type === 'dine-in' && 
          (order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready')
        );
        setActiveOrders(selectedTable 
          ? filtered.filter((o: Order) => o.table_id === selectedTable)
          : filtered
        );
      }
    } catch (error) {
      console.error('Error loading active orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/${orderId}`, { status });
      await loadActiveOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const markItemServed = async (orderId: string, itemIndex: number) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/${orderId}/items/${itemIndex}/status`, { 
        status: 'served'
      });
      await loadActiveOrders();
    } catch (error) {
      console.error('Error marking item as served:', error);
    }
  };

  const tableColumns = [
    {
      title: 'Table',
      dataIndex: 'number',
      key: 'number',
      render: (text: string, record: TableType) => (
        <Space>
          <Text strong>{text}</Text>
          <Tag color={record.status === 'occupied' ? 'red' : 'green'}>
            {record.status}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: TableType) => (
        <Button
          type={selectedTable === record.id ? 'primary' : 'default'}
          onClick={() => setSelectedTable(selectedTable === record.id ? null : record.id)}
        >
          {selectedTable === record.id ? 'Deselect' : 'Select'}
        </Button>
      ),
    },
  ];

  const orderColumns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Table',
      dataIndex: 'table_number',
      key: 'table_number',
      render: (text: string) => text ? <Tag color="blue">Table {text}</Tag> : '-',
    },
    {
      title: 'Items',
      key: 'items',
      render: (_: any, record: Order) => (
        <Space direction="vertical" size="small">
          {record.items.map((item, index) => (
            <div key={index}>
              <Text>{item.product_name} x{item.quantity}</Text>
              <Tag color={item.status === 'ready' ? 'green' : item.status === 'preparing' ? 'blue' : 'orange'}>
                {item.status}
              </Tag>
              {item.status === 'ready' && (
                <Button
                  size="small"
                  type="link"
                  icon={<CheckCircleOutlined />}
                  onClick={() => markItemServed(record.id, index)}
                >
                  Mark Served
                </Button>
              )}
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          confirmed: 'blue',
          preparing: 'orange',
          ready: 'green',
          served: 'cyan',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space>
          {record.status === 'confirmed' && (
            <Button
              size="small"
              onClick={() => updateOrderStatus(record.id, 'preparing')}
            >
              Start Preparing
            </Button>
          )}
          {record.status === 'preparing' && (
            <Button
              size="small"
              type="primary"
              onClick={() => updateOrderStatus(record.id, 'ready')}
            >
              Mark Ready
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Waiter Management</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Tables" style={{ marginBottom: 16 }}>
            <Table
              dataSource={tables}
              columns={tableColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Active Orders</span>
                {selectedTable && (
                  <Tag color="blue">Filtered by Table</Tag>
                )}
              </Space>
            }
          >
            {activeOrders.length === 0 ? (
              <Empty description="No active orders" />
            ) : (
              <Table
                dataSource={activeOrders}
                columns={orderColumns}
                rowKey="id"
                pagination={false}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

