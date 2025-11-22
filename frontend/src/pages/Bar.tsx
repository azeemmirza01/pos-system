import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Space, Typography, Badge, Empty } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Order, OrderItem } from '../types';
import axios from 'axios';

const { Title, Text } = Typography;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Bar() {
  const { isOnline } = usePosStore();
  const [barOrders, setBarOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadBarOrders();
    const interval = setInterval(() => {
      loadBarOrders();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const loadBarOrders = async () => {
    try {
      if (isOnline) {
        console.log('[Bar] Fetching orders from:', `${API_BASE_URL}/orders?station=bar`);
        const response = await axios.get(`${API_BASE_URL}/orders?station=bar`);
        console.log('[Bar] Received orders:', response.data.length, response.data);
        
        const filtered = response.data.filter((order: Order) => {
          const hasBarItems = order.items.some(item => 
            item.station === 'bar' && 
            (item.status === 'pending' || item.status === 'preparing')
          );
          if (hasBarItems) {
            console.log('[Bar] Order has bar items:', order.order_number, order.items);
          }
          return hasBarItems;
        });
        
        console.log('[Bar] Filtered bar orders:', filtered.length);
        setBarOrders(filtered);
      } else {
        console.warn('[Bar] Cannot load orders: offline');
      }
    } catch (error) {
      console.error('[Bar] Error loading bar orders:', error);
    }
  };

  const updateItemStatus = async (orderId: string, itemIndex: number, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/orders/${orderId}/items/${itemIndex}/status`, { 
        status,
        station: 'bar'
      });
      await loadBarOrders();
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'preparing': return 'blue';
      case 'ready': return 'green';
      default: return 'default';
    }
  };

  const getBarItems = (order: Order): OrderItem[] => {
    return order.items.filter(item => item.station === 'bar');
  };

  return (
    <div>
      <Title level={2}>Bar Display</Title>
      <Row gutter={[16, 16]}>
        {barOrders.length === 0 ? (
          <Col span={24}>
            <Empty description="No bar orders" />
          </Col>
        ) : (
          barOrders.map((order) => {
            const barItems = getBarItems(order);
            if (barItems.length === 0) return null;

            return (
              <Col xs={24} sm={12} lg={8} key={order.id}>
                <Card
                  title={
                    <Space>
                      <Text strong>Order #{order.order_number}</Text>
                      {order.table_number && (
                        <Tag color="blue">Table {order.table_number}</Tag>
                      )}
                    </Space>
                  }
                  extra={
                    <Badge
                      count={barItems.filter(i => i.status === 'pending' || i.status === 'preparing').length}
                      style={{ backgroundColor: '#ff4d4f' }}
                    />
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {barItems.map((item, index) => {
                      const itemIndex = order.items.findIndex(i => 
                        i.product_id === item.product_id && i.station === 'bar'
                      );
                      return (
                        <Card
                          key={`${item.product_id}-${index}`}
                          size="small"
                          style={{
                            border: `2px solid ${
                              item.status === 'pending' ? '#ff9800' :
                              item.status === 'preparing' ? '#1890ff' :
                              '#4caf50'
                            }`,
                            backgroundColor: item.status === 'ready' ? '#e8f5e9' : '#fff'
                          }}
                        >
                          <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ fontSize: 16 }}>
                                {item.product_name}
                              </Text>
                              <Tag color={getStatusColor(item.status)}>
                                {item.status.toUpperCase()}
                              </Tag>
                            </div>
                            <Text type="secondary">Qty: {item.quantity}</Text>
                            {item.notes && (
                              <Text type="secondary" style={{ fontStyle: 'italic' }}>
                                Note: {item.notes}
                              </Text>
                            )}
                            <Space>
                              {item.status === 'pending' && (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<ClockCircleOutlined />}
                                  onClick={() => updateItemStatus(order.id, itemIndex, 'preparing')}
                                >
                                  Start Preparing
                                </Button>
                              )}
                              {item.status === 'preparing' && (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<CheckCircleOutlined />}
                                  onClick={() => updateItemStatus(order.id, itemIndex, 'ready')}
                                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                >
                                  Mark Ready
                                </Button>
                              )}
                              {item.status === 'ready' && (
                                <Text type="success" strong>Ready for Service</Text>
                              )}
                            </Space>
                          </Space>
                        </Card>
                      );
                    })}
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Order Time: {new Date(order.created_at || '').toLocaleTimeString()}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })
        )}
      </Row>
    </div>
  );
}

