import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag, message, Empty, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MergeCellsOutlined, SplitCellsOutlined, SwapOutlined } from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Table } from '../types';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Tables() {
  const { modal } = App.useApp();
  const store = usePosStore();
  const { currentOutlet, isOnline } = store;
  const tables = store.tables || [];
  const loadTables = store.loadTables;
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOnline && loadTables) {
      loadTables().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOutlet, isOnline]);

  const handleAdd = () => {
    setEditingTable(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    form.setFieldsValue(table);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (isOnline) {
        await axios.delete(`${API_BASE_URL}/tables/${id}`);
        message.success('Table deleted successfully');
        if (loadTables) {
          loadTables().catch(console.error);
        }
      }
    } catch (error) {
      message.error('Error deleting table');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!isOnline) {
        message.warning('You are offline. Please connect to the internet to save tables.');
        return;
      }

      // Ensure outlet_id is provided
      const outletId = currentOutlet?.id || values.outlet_id;
      if (!outletId) {
        message.error('Please select an outlet first in Settings');
        return;
      }

      const tableData = {
        ...values,
        outlet_id: outletId,
        capacity: Number(values.capacity), // Ensure capacity is a number
      };

      let newTable;
      if (editingTable) {
        const response = await axios.put(`${API_BASE_URL}/tables/${editingTable.id}`, tableData);
        console.log('Table updated:', response.data);
        newTable = response.data;
        message.success('Table updated successfully');
      } else {
        const response = await axios.post(`${API_BASE_URL}/tables`, tableData);
        console.log('Table created:', response.data);
        newTable = response.data;
        message.success('Table created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      
      // Optimistically update the store immediately
      const currentTables = usePosStore.getState().tables || [];
      if (newTable) {
        if (editingTable) {
          // Update existing table in store
          const updatedTables = currentTables.map((table: Table) =>
            table.id === newTable.id ? newTable : table
          );
          usePosStore.setState({ tables: updatedTables });
          console.log('[Tables] Optimistically updated table in store');
        } else {
          // Add new table to store
          usePosStore.setState({ tables: [...currentTables, newTable] });
          console.log('[Tables] Optimistically added table to store');
        }
      }
      
      // Wait a bit for database to commit, then reload from server
      setTimeout(async () => {
        if (loadTables) {
          try {
            console.log('[Tables] Reloading tables from server after delay...');
            await loadTables();
            const reloadedTables = usePosStore.getState().tables || [];
            console.log('[Tables] Reloaded tables from server:', reloadedTables.length);
          } catch (error) {
            console.error('[Tables] Error reloading tables:', error);
            // Don't show error since we already optimistically updated
          }
        }
      }, 500); // Wait 500ms for database to commit
    } catch (error: any) {
      console.error('Error saving table:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving table';
      message.error(`Error saving table: ${errorMessage}`);
    }
  };

  const handleMerge = async () => {
    modal.confirm({
      title: 'Merge Tables',
      content: 'Select tables to merge',
      onOk: async () => {
        // Implementation for merging tables
        message.info('Merge functionality coming soon');
      }
    });
  };

  const handleSplit = async (table: Table) => {
    modal.confirm({
      title: 'Split Table',
      content: `Split table ${table.number} into multiple tables?`,
      onOk: async () => {
        // Implementation for splitting table
        message.info('Split functionality coming soon');
      }
    });
  };

  const handleTransfer = async (table: Table) => {
    modal.confirm({
      title: 'Transfer Table',
      content: `Transfer order from table ${table.number}?`,
      onOk: async () => {
        // Implementation for transferring table
        message.info('Transfer functionality coming soon');
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green';
      case 'occupied': return 'red';
      case 'reserved': return 'orange';
      case 'cleaning': return 'blue';
      default: return 'default';
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={2}>Table Management</Title>
        <Space>
          <Button type="default" icon={<MergeCellsOutlined />} onClick={handleMerge}>
            Merge Tables
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Table
          </Button>
        </Space>
      </Space>

      {tables.length === 0 ? (
        <Empty 
          description="No tables found. Add your first table to get started."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {tables.map((table) => (
            <Col xs={24} sm={12} lg={8} key={table.id}>
              <Card
                title={
                  <Space>
                    <span>Table {table.number}</span>
                    <Tag color={getStatusColor(table.status)}>{table.status}</Tag>
                  </Space>
                }
                extra={
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(table)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(table.id)}
                    />
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div><strong>Capacity:</strong> {table.capacity} guests</div>
                  {table.location && <div><strong>Location:</strong> {table.location}</div>}
                  <Space>
                    <Button
                      size="small"
                      icon={<SplitCellsOutlined />}
                      onClick={() => handleSplit(table)}
                    >
                      Split
                    </Button>
                    <Button
                      size="small"
                      icon={<SwapOutlined />}
                      onClick={() => handleTransfer(table)}
                    >
                      Transfer
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingTable ? 'Edit Table' : 'Add Table'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {!currentOutlet && (
            <Form.Item>
              <Typography.Text type="warning">
                ⚠️ No outlet selected. Please select an outlet in Settings first.
              </Typography.Text>
            </Form.Item>
          )}
          {currentOutlet && (
            <Form.Item label="Outlet">
              <Tag color="blue">{currentOutlet.name}</Tag>
            </Form.Item>
          )}
          <Form.Item 
            name="number" 
            label="Table Number" 
            rules={[
              { required: true, message: 'Please enter a table number' },
              { pattern: /^[A-Za-z0-9\s-]+$/, message: 'Table number can only contain letters, numbers, spaces, and hyphens' }
            ]}
          >
            <Input placeholder="e.g., T-01, Table 1" />
          </Form.Item>
          <Form.Item 
            name="capacity" 
            label="Capacity (guests)" 
            rules={[
              { required: true, message: 'Please enter table capacity' },
              { type: 'number', min: 1, message: 'Capacity must be at least 1' }
            ]}
          >
            <InputNumber min={1} max={50} style={{ width: '100%' }} placeholder="Number of guests" />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input placeholder="e.g., Main Hall, Patio, VIP" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="available">
            <Select>
              <Option value="available">Available</Option>
              <Option value="occupied">Occupied</Option>
              <Option value="reserved">Reserved</Option>
              <Option value="cleaning">Cleaning</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

