import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  Divider,
  Tag,
  Row,
  Col,
  Table,
  Modal,
  Form,
  InputNumber,
  Select,
  Empty,
  App,
} from 'antd';
import {
  SyncOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  DollarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Tax, Outlet } from '../types';
import axios from 'axios';

const { Text } = Typography;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Settings() {
  const { message } = App.useApp();
  
  // Use Zustand selector to ensure re-renders on changes
  const outlets = usePosStore((state) => state.outlets) || [];
  const taxes = usePosStore((state) => state.taxes) || [];
  const isOnline = usePosStore((state) => state.isOnline);
  const sync = usePosStore((state) => state.sync);
  const syncStatus = usePosStore((state) => state.syncStatus);
  const currentOutlet = usePosStore((state) => state.currentOutlet);
  const loadOutlets = usePosStore((state) => state.loadOutlets);
  const loadTaxes = usePosStore((state) => state.loadTaxes);
  
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('apiUrl') || 'http://localhost:3000/api'
  );
  const [loading, setLoading] = useState(false);
  const [isTaxModalVisible, setIsTaxModalVisible] = useState(false);
  const [isOutletModalVisible, setIsOutletModalVisible] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [taxForm] = Form.useForm();
  const [outletForm] = Form.useForm();

  useEffect(() => {
    if (isOnline && loadOutlets && loadTaxes) {
      loadOutlets().catch(console.error);
      loadTaxes().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Debug: Log when outlets change
  useEffect(() => {
    console.log('[Settings] Outlets updated:', outlets.length, outlets);
  }, [outlets]);

  const handleSync = async () => {
    setLoading(true);
    try {
      await sync();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiUrl = () => {
    localStorage.setItem('apiUrl', apiUrl);
    message.success('API URL saved successfully!');
  };

  const getSyncStatusTag = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Tag icon={<SyncOutlined spin />} color="processing">Syncing...</Tag>;
      case 'success':
        return <Tag icon={<CheckCircleOutlined />} color="success">Synced</Tag>;
      case 'error':
        return <Tag icon={<CloseCircleOutlined />} color="error">Error</Tag>;
      default:
        return <Tag color="default">Idle</Tag>;
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CloudOutlined />
                <span>Sync Settings</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Connection Status: </Text>
                <Tag color={isOnline ? 'success' : 'error'}>
                  {isOnline ? 'Online' : 'Offline'}
                </Tag>
              </div>

              <div>
                <Text strong>Sync Status: </Text>
                {getSyncStatusTag()}
              </div>

              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={handleSync}
                loading={loading}
                disabled={!isOnline}
                block
                size="large"
              >
                Sync Now
              </Button>

              <Text type="secondary" style={{ fontSize: 12 }}>
                {isOnline
                  ? 'Click to manually sync data with cloud server'
                  : 'You are offline. Sync will happen automatically when connection is restored.'}
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DatabaseOutlined />
                <span>API Configuration</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>API URL</Text>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="Enter API URL"
                  style={{ marginTop: 8 }}
                  size="large"
                />
              </div>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveApiUrl}
                block
              >
                Save API URL
              </Button>

              <Text type="secondary" style={{ fontSize: 12 }}>
                Configure the backend API endpoint for cloud synchronization
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title="System Information"
        style={{ marginTop: 16, borderRadius: 6 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between">
            <Text>Application Version:</Text>
            <Text strong>1.0.0</Text>
          </Row>
          <Divider style={{ margin: '8px 0' }} />
          <Row justify="space-between">
            <Text>Database:</Text>
            <Text strong>SQLite (Local)</Text>
          </Row>
          <Divider style={{ margin: '8px 0' }} />
          <Row justify="space-between">
            <Text>Cloud Database:</Text>
            <Text strong>MongoDB</Text>
          </Row>
        </Space>
      </Card>

      {/* Multi-Outlet Management */}
      <Card
        title={
          <Space>
            <ShopOutlined />
            <span>Outlet Management</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={async () => {
                if (loadOutlets) {
                  try {
                    await loadOutlets();
                    message.success('Outlets refreshed');
                  } catch (error) {
                    message.error('Error refreshing outlets');
                  }
                }
              }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingOutlet(null);
                outletForm.resetFields();
                setIsOutletModalVisible(true);
              }}
            >
              Add Outlet
            </Button>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Current Outlet: </Text>
            <Tag color="blue">{currentOutlet?.name || 'None Selected'}</Tag>
          </div>
          {outlets.length === 0 ? (
            <Empty 
              description="No outlets found. Add your first outlet to get started."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={outlets}
              rowKey="id"
              pagination={false}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Address',
                dataIndex: 'address',
                key: 'address',
              },
              {
                title: 'Status',
                dataIndex: 'is_active',
                key: 'is_active',
                render: (isActive: boolean) => (
                  <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Tag>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_: any, record: Outlet) => (
                  <Space>
                    <Button
                      size="small"
                      onClick={() => {
                        try {
                          // Get setOutlet directly from store state
                          const store = usePosStore.getState();
                          console.log('[Settings] Store state:', store);
                          console.log('[Settings] setOutlet available:', typeof store.setOutlet);
                          
                          if (store.setOutlet && typeof store.setOutlet === 'function') {
                            store.setOutlet(record);
                            message.success(`Selected outlet: ${record.name}`);
                            
                            // Verify it was set
                            const updatedStore = usePosStore.getState();
                            console.log('[Settings] Current outlet after set:', updatedStore.currentOutlet);
                          } else {
                            // Last resort: manually update the store
                            console.warn('[Settings] setOutlet not available, manually updating store');
                            try {
                              if (typeof window !== 'undefined' && window.localStorage) {
                                localStorage.setItem('currentOutlet', JSON.stringify(record));
                              }
                              usePosStore.setState({ currentOutlet: record });
                              message.success(`Selected outlet: ${record.name}`);
                            } catch (manualError) {
                              console.error('[Settings] Manual update failed:', manualError);
                              message.error('Failed to select outlet');
                            }
                          }
                        } catch (error) {
                          console.error('[Settings] Error selecting outlet:', error);
                          message.error('Failed to select outlet');
                        }
                      }}
                    >
                      Select
                    </Button>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingOutlet(record);
                        outletForm.setFieldsValue(record);
                        setIsOutletModalVisible(true);
                      }}
                    />
                  </Space>
                ),
              },
            ]}
          />
          )}
        </Space>
      </Card>

      {/* Multi-Tax Management */}
      <Card
        title={
          <Space>
            <DollarOutlined />
            <span>Tax Management</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTax(null);
              taxForm.resetFields();
              setIsTaxModalVisible(true);
            }}
          >
            Add Tax
          </Button>
        }
        style={{ marginTop: 16 }}
      >
        <Table
          dataSource={taxes}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
            },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => <Tag>{type}</Tag>,
              },
              {
                title: 'Rate',
                dataIndex: 'rate',
                key: 'rate',
                render: (rate: number) => `${rate}%`,
              },
              {
                title: 'Status',
                dataIndex: 'is_active',
                key: 'is_active',
                render: (isActive: boolean) => (
                  <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Tag>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_: any, record: Tax) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingTax(record);
                        taxForm.setFieldsValue(record);
                        setIsTaxModalVisible(true);
                      }}
                    />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={async () => {
                        try {
                          await axios.delete(`${API_BASE_URL}/taxes/${record.id}`);
                          message.success('Tax deleted successfully');
                          if (loadTaxes) {
                            loadTaxes().catch(console.error);
                          }
                        } catch (error) {
                          message.error('Error deleting tax');
                        }
                      }}
                    />
                  </Space>
                ),
              },
            ]}
        />
      </Card>

      {/* Tax Modal */}
      <Modal
        title={editingTax ? 'Edit Tax' : 'Add Tax'}
        open={isTaxModalVisible}
        onCancel={() => setIsTaxModalVisible(false)}
        onOk={() => taxForm.submit()}
      >
        <Form
          form={taxForm}
          onFinish={async (values) => {
            try {
              if (editingTax) {
                await axios.put(`${API_BASE_URL}/taxes/${editingTax.id}`, values);
                message.success('Tax updated successfully');
              } else {
                await axios.post(`${API_BASE_URL}/taxes`, values);
                message.success('Tax created successfully');
              }
              setIsTaxModalVisible(false);
              if (loadTaxes) {
                loadTaxes().catch(console.error);
              }
            } catch (error) {
              message.error('Error saving tax');
            }
          }}
          layout="vertical"
        >
          <Form.Item name="name" label="Tax Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Tax Type" rules={[{ required: true }]}>
            <Select>
              <Option value="VAT">VAT</Option>
              <Option value="GST">GST</Option>
              <Option value="HST">HST</Option>
              <Option value="CUSTOM">Custom</Option>
            </Select>
          </Form.Item>
          <Form.Item name="rate" label="Rate (%)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Status" initialValue={true}>
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Outlet Modal */}
      <Modal
        title={editingOutlet ? 'Edit Outlet' : 'Add Outlet'}
        open={isOutletModalVisible}
        onCancel={() => setIsOutletModalVisible(false)}
        onOk={() => outletForm.submit()}
      >
        <Form
          form={outletForm}
          onFinish={async (values) => {
            try {
              if (!isOnline) {
                message.warning('You are offline. Please connect to the internet to save outlets.');
                return;
              }

              let newOutlet;
              if (editingOutlet) {
                const response = await axios.put(`${API_BASE_URL}/outlets/${editingOutlet.id}`, values);
                console.log('Outlet updated:', response.data);
                newOutlet = response.data;
                message.success('Outlet updated successfully');
              } else {
                const response = await axios.post(`${API_BASE_URL}/outlets`, values);
                console.log('Outlet created:', response.data);
                newOutlet = response.data;
                message.success('Outlet created successfully');
              }
              
              setIsOutletModalVisible(false);
              outletForm.resetFields();
              
              // Optimistically update the store immediately
              const currentOutlets = usePosStore.getState().outlets || [];
              if (newOutlet) {
                if (editingOutlet) {
                  // Update existing outlet in store
                  const updatedOutlets = currentOutlets.map((outlet: Outlet) =>
                    outlet.id === newOutlet.id ? newOutlet : outlet
                  );
                  usePosStore.setState({ outlets: updatedOutlets });
                  console.log('[Settings] Optimistically updated outlet in store');
                } else {
                  // Add new outlet to store
                  usePosStore.setState({ outlets: [...currentOutlets, newOutlet] });
                  console.log('[Settings] Optimistically added outlet to store');
                }
              }
              
              // Wait a bit for database to commit, then reload from server
              setTimeout(async () => {
                if (loadOutlets) {
                  try {
                    console.log('[Settings] Reloading outlets from server after delay...');
                    await loadOutlets();
                    const reloadedOutlets = usePosStore.getState().outlets || [];
                    console.log('[Settings] Reloaded outlets from server:', reloadedOutlets.length, reloadedOutlets);
                  } catch (error) {
                    console.error('[Settings] Error reloading outlets:', error);
                    // Don't show error since we already optimistically updated
                  }
                }
              }, 500); // Wait 500ms for database to commit
            } catch (error: any) {
              console.error('Error saving outlet:', error);
              const errorMessage = error.response?.data?.error || error.message || 'Error saving outlet';
              message.error(`Error saving outlet: ${errorMessage}`);
            }
          }}
          layout="vertical"
        >
          <Form.Item name="name" label="Outlet Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="is_active" label="Status" initialValue={true}>
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

