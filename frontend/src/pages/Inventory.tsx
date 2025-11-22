import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag, message, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Ingredient, Waste } from '../types';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Inventory() {
  const { currentOutlet, isOnline } = usePosStore();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Ingredient[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWasteModalVisible, setIsWasteModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [form] = Form.useForm();
  const [wasteForm] = Form.useForm();

  useEffect(() => {
    if (isOnline) {
      loadIngredients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOutlet, isOnline]);

  const loadIngredients = async () => {
    try {
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/ingredients${currentOutlet ? `?outlet_id=${currentOutlet.id}` : ''}`);
        setIngredients(response.data);
        const lowStock = response.data.filter((ing: Ingredient) => ing.current_stock <= ing.min_stock);
        setLowStockItems(lowStock);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const handleAdd = () => {
    setEditingIngredient(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    form.setFieldsValue(ingredient);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (isOnline) {
        await axios.delete(`${API_BASE_URL}/ingredients/${id}`);
        message.success('Ingredient deleted successfully');
        loadIngredients();
      }
    } catch (error) {
      message.error('Error deleting ingredient');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (isOnline) {
        const data = {
          ...values,
          outlet_id: currentOutlet?.id
        };
        if (editingIngredient) {
          await axios.put(`${API_BASE_URL}/ingredients/${editingIngredient.id}`, data);
          message.success('Ingredient updated successfully');
        } else {
          await axios.post(`${API_BASE_URL}/ingredients`, data);
          message.success('Ingredient created successfully');
        }
        setIsModalVisible(false);
        loadIngredients();
      }
    } catch (error) {
      message.error('Error saving ingredient');
    }
  };

  const handleWaste = (ingredient: Ingredient) => {
    wasteForm.setFieldsValue({ ingredient_id: ingredient.id, ingredient_name: ingredient.name, unit: ingredient.unit });
    setIsWasteModalVisible(true);
  };

  const handleWasteSubmit = async (values: any) => {
    try {
      if (isOnline) {
        await axios.post(`${API_BASE_URL}/waste`, {
          ...values,
          outlet_id: currentOutlet?.id
        });
        message.success('Waste recorded successfully');
        setIsWasteModalVisible(false);
        wasteForm.resetFields();
        loadIngredients();
      }
    } catch (error) {
      message.error('Error recording waste');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock: number, record: Ingredient) => (
        <Space>
          <span>{stock} {record.unit}</span>
          {stock <= record.min_stock && (
            <Tag color="red" icon={<WarningOutlined />}>Low Stock</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Min Stock',
      dataIndex: 'min_stock',
      key: 'min_stock',
      render: (min: number, record: Ingredient) => `${min} ${record.unit}`,
    },
    {
      title: 'Max Stock',
      dataIndex: 'max_stock',
      key: 'max_stock',
      render: (max: number, record: Ingredient) => `${max} ${record.unit}`,
    },
    {
      title: 'Cost/Unit',
      dataIndex: 'cost_per_unit',
      key: 'cost_per_unit',
      render: (cost: number) => `$${cost.toFixed(2)}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Ingredient) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            size="small"
            danger
            onClick={() => handleWaste(record)}
          >
            Record Waste
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={2}>Inventory Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Ingredient
        </Button>
      </Space>

      {lowStockItems.length > 0 && (
        <Alert
          message={`${lowStockItems.length} items are low on stock`}
          type="warning"
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      <Card>
        <Table
          dataSource={ingredients}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unit" label="Unit" rules={[{ required: true }]} initialValue="piece">
            <Select>
              <Option value="piece">Piece</Option>
              <Option value="kg">Kilogram</Option>
              <Option value="g">Gram</Option>
              <Option value="liter">Liter</Option>
              <Option value="ml">Milliliter</Option>
            </Select>
          </Form.Item>
          <Form.Item name="current_stock" label="Current Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="min_stock" label="Min Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="max_stock" label="Max Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cost_per_unit" label="Cost per Unit">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item name="supplier" label="Supplier">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Record Waste"
        open={isWasteModalVisible}
        onCancel={() => setIsWasteModalVisible(false)}
        onOk={() => wasteForm.submit()}
      >
        <Form form={wasteForm} onFinish={handleWasteSubmit} layout="vertical">
          <Form.Item name="ingredient_name" label="Ingredient">
            <Input disabled />
          </Form.Item>
          <Form.Item name="quantity" label="Waste Quantity" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="Unit">
            <Input disabled />
          </Form.Item>
          <Form.Item name="reason" label="Reason">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="cost" label="Cost">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

