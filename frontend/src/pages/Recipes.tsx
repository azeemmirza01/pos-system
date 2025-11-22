import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space, Typography, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Recipe, Ingredient, Product } from '../types';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Recipes() {
  const store = usePosStore();
  const products = store.products || [];
  const { currentOutlet, isOnline } = store;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOnline) {
      loadRecipes();
      loadIngredients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOutlet, isOnline]);

  const loadRecipes = async () => {
    try {
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/recipes`);
        setRecipes(response.data);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const loadIngredients = async () => {
    try {
      if (isOnline) {
        const response = await axios.get(`${API_BASE_URL}/ingredients`);
        setIngredients(response.data);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const handleAdd = () => {
    setEditingRecipe(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    form.setFieldsValue(recipe);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (isOnline) {
        await axios.delete(`${API_BASE_URL}/recipes/${id}`);
        message.success('Recipe deleted successfully');
        loadRecipes();
      }
    } catch (error) {
      message.error('Error deleting recipe');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (isOnline) {
        const data = {
          ...values,
          outlet_id: currentOutlet?.id
        };
        if (editingRecipe) {
          await axios.put(`${API_BASE_URL}/recipes/${editingRecipe.id}`, data);
          message.success('Recipe updated successfully');
        } else {
          await axios.post(`${API_BASE_URL}/recipes`, data);
          message.success('Recipe created successfully');
        }
        setIsModalVisible(false);
        loadRecipes();
      }
    } catch (error) {
      message.error('Error saving recipe');
    }
  };

  const columns = [
    {
      title: 'Recipe Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: Recipe) => {
        const product = products.find(p => p.id === record.product_id);
        return product?.name || record.product_id;
      },
    },
    {
      title: 'Ingredients',
      key: 'ingredients',
      render: (_: any, record: Recipe) => (
        <Space wrap>
          {record.ingredients.map((ing, index) => {
            const ingredient = ingredients.find(i => i.id === ing.ingredient_id);
            return (
              <Tag key={index}>
                {ingredient?.name || ing.ingredient_id}: {ing.quantity} {ing.unit}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: 'Prep Time',
      dataIndex: 'preparation_time',
      key: 'preparation_time',
      render: (time: number) => time ? `${time} min` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Recipe) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
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
        <Title level={2}>Recipe Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Recipe
        </Button>
      </Space>

      <Card>
        <Table
          dataSource={recipes}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRecipe ? 'Edit Recipe' : 'Add Recipe'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Recipe Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product_id" label="Product" rules={[{ required: true }]}>
            <Select placeholder="Select product">
              {products.map(product => (
                <Option key={product.id} value={product.id}>{product.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="preparation_time" label="Preparation Time (minutes)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="instructions" label="Instructions">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Ingredients">
            <Form.List name="ingredients">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'ingredient_id']}
                        rules={[{ required: true, message: 'Select ingredient' }]}
                      >
                        <Select placeholder="Ingredient" style={{ width: 200 }}>
                          {ingredients.map(ing => (
                            <Option key={ing.id} value={ing.id}>{ing.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'quantity']}
                        rules={[{ required: true, message: 'Enter quantity' }]}
                      >
                        <InputNumber placeholder="Quantity" min={0} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'unit']}
                        rules={[{ required: true, message: 'Enter unit' }]}
                      >
                        <Input placeholder="Unit" style={{ width: 100 }} />
                      </Form.Item>
                      <Button onClick={() => remove(field.name)}>Remove</Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Ingredient
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

