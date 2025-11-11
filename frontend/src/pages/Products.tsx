import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  InputNumber,
  Typography,
  Space,
  Tag,
  Image,
  message,
  Popconfirm,
  Card,
} from 'antd';
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Product } from '../types';
import imageService from '../services/imageService';

const { Title } = Typography;
const { TextArea } = Input;

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, loadProducts } = usePosStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load product images for table
  useEffect(() => {
    const loadProductImages = async () => {
      const imageMap: Record<string, string> = {};
      for (const product of products) {
        if (product.image_url) {
          try {
            const imageUrl = await imageService.getImageUrl(product.image_url);
            if (imageUrl) {
              imageMap[product.id] = imageUrl;
            }
          } catch (error) {
            console.error(`Error loading image for product ${product.id}:`, error);
          }
        }
      }
      setProductImages(imageMap);
    };
    loadProductImages();
  }, [products]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.includes(searchQuery) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadImagePreview = async (filename: string) => {
    if (filename) {
      try {
        const imageUrl = await imageService.getImageUrl(filename);
        setImagePreview(imageUrl);
      } catch (error) {
        console.error('Error loading image:', error);
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  };

  const handleOpenModal = async (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      form.setFieldsValue({
        name: product.name,
        price: product.price,
        description: product.description || '',
        stock: product.stock || 0,
        category: product.category || '',
        barcode: product.barcode || '',
        image_url: product.image_url || '',
      });
      if (product.image_url) {
        await loadImagePreview(product.image_url);
      } else {
        setImagePreview(null);
      }
    } else {
      setEditingProduct(null);
      form.resetFields();
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
    setImagePreview(null);
  };

  const handleImageSelect = async () => {
    try {
      setIsUploadingImage(true);
      const filename = await imageService.selectImage();
      if (filename) {
        form.setFieldsValue({ image_url: filename });
        await loadImagePreview(filename);
        message.success('Image selected successfully');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      message.error('Error selecting image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    form.setFieldsValue({ image_url: '' });
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const productData = {
        ...values,
        price: parseFloat(values.price),
        stock: parseInt(values.stock) || 0,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        message.success('Product updated successfully');
      } else {
        await addProduct(productData);
        message.success('Product added successfully');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Error deleting product. Please try again.');
    }
  };

  const columns = [
    {
      title: 'Image',
      key: 'image',
      width: 100,
      render: (_: any, record: Product) => (
        <Image
          width={60}
          height={60}
          src={productImages[record.id] || undefined}
          alt={record.name}
          style={{ objectFit: 'cover', borderRadius: 6 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29A2MDQH6CxKbQvYPAJ0loxlHQKMdAwMOQwUJxQUlqO4oZQwz8ewMbG0ZBNxBiSgMDA7uP//8syDgOaBQd1f//P8f///9+IMDg/8PAwMBmAFAFQJ0LmnKjXQAAAFZlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA5KGAAcAAAASAAAARKACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAABBU0NJSQAAAFNjcmVlbnNob3Q5V0xEAAAB1mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoZXuEHAABAAElEQVR4Ae1dB3gU1Rb+0"
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category || <Tag color="default">Uncategorized</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: Product, b: Product) => a.price - b.price,
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: Product, b: Product) => a.stock - b.stock,
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      render: (barcode: string) => barcode || <Tag color="default">N/A</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
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
            Products
          </Title>
          <Space>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
              allowClear
              size="large"
            />
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => handleOpenModal(null)}
              size="large"
            >
              Add Product
            </Button>
          </Space>
        </Space>
      </Card>

      <Card style={{ borderRadius: 6 }}>
        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
          }}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={600}
        okText={editingProduct ? 'Update' : 'Add'}
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            stock: 0,
            price: 0,
          }}
        >
          <Form.Item label="Product Image">
            <Space direction="vertical" style={{ width: '100%' }}>
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Image
                    width={120}
                    height={120}
                    src={imagePreview}
                    alt="Product preview"
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                  />
                  <Button
                    type="primary"
                    danger
                    size="small"
                    onClick={handleRemoveImage}
                    style={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    border: '2px dashed #d9d9d9',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PictureOutlined style={{ fontSize: 32, color: '#bfbfbf' }} />
                </div>
              )}
              <Button
                icon={<PictureOutlined />}
                onClick={handleImageSelect}
                loading={isUploadingImage}
              >
                {imagePreview ? 'Change Image' : 'Select Image'}
              </Button>
            </Space>
            <Form.Item name="image_url" hidden>
              <Input />
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" size="large" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: 'Please enter price' },
              { type: 'number', min: 0, message: 'Price must be positive' },
            ]}
          >
            <InputNumber
              placeholder="Enter price"
              style={{ width: '100%' }}
              prefix="$"
              min={0}
              step={0.01}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Stock"
            rules={[{ type: 'number', min: 0, message: 'Stock must be non-negative' }]}
          >
            <InputNumber
              placeholder="Enter stock quantity"
              style={{ width: '100%' }}
              min={0}
              size="large"
            />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Input placeholder="Enter category" size="large" />
          </Form.Item>

          <Form.Item name="barcode" label="Barcode">
            <Input placeholder="Enter barcode" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              placeholder="Enter product description"
              rows={3}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

