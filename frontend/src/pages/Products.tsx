import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  Image,
  message,
  Popconfirm,
  Card,
  Select,
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
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

const { TextArea } = Input;
const { Option } = Select;

// Predefined categories organized by station
const PRODUCT_CATEGORIES = [
  // Bar Categories
  { value: 'Beverage', label: 'Beverage (Bar)', station: 'bar' },
  { value: 'Drink', label: 'Drink (Bar)', station: 'bar' },
  { value: 'Coffee', label: 'Coffee (Bar)', station: 'bar' },
  { value: 'Tea', label: 'Tea (Bar)', station: 'bar' },
  { value: 'Juice', label: 'Juice (Bar)', station: 'bar' },
  { value: 'Soda', label: 'Soda (Bar)', station: 'bar' },
  { value: 'Beer', label: 'Beer (Bar)', station: 'bar' },
  { value: 'Wine', label: 'Wine (Bar)', station: 'bar' },
  { value: 'Cocktail', label: 'Cocktail (Bar)', station: 'bar' },
  { value: 'Bar', label: 'Bar Items (Bar)', station: 'bar' },
  
  // Kitchen Categories
  { value: 'Food', label: 'Food (Kitchen)', station: 'kitchen' },
  { value: 'Meal', label: 'Meal (Kitchen)', station: 'kitchen' },
  { value: 'Dish', label: 'Dish (Kitchen)', station: 'kitchen' },
  { value: 'Appetizer', label: 'Appetizer (Kitchen)', station: 'kitchen' },
  { value: 'Main Course', label: 'Main Course (Kitchen)', station: 'kitchen' },
  { value: 'Dessert', label: 'Dessert (Kitchen)', station: 'kitchen' },
  { value: 'Salad', label: 'Salad (Kitchen)', station: 'kitchen' },
  { value: 'Soup', label: 'Soup (Kitchen)', station: 'kitchen' },
  { value: 'Pastry', label: 'Pastry (Kitchen)', station: 'kitchen' },
  { value: 'Snack', label: 'Snack (Kitchen)', station: 'kitchen' },
  
  // General Categories
  { value: 'Other', label: 'Other', station: 'none' },
];

export default function Products() {
  const store = usePosStore();
  const products = store.products || [];
  const { addProduct, updateProduct, deleteProduct, loadProducts } = store;
  const currency = usePosStore((state) => state.currency) || 'USD';
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  // Sample cafe products
  const sampleCafeProducts = [
    { name: 'Espresso', price: 2.50, description: 'Strong Italian coffee', category: 'Beverages', stock: 100 },
    { name: 'Cappuccino', price: 3.50, description: 'Espresso with steamed milk foam', category: 'Beverages', stock: 100 },
    { name: 'Latte', price: 4.00, description: 'Espresso with steamed milk', category: 'Beverages', stock: 100 },
    { name: 'Americano', price: 3.00, description: 'Espresso with hot water', category: 'Beverages', stock: 100 },
    { name: 'Mocha', price: 4.50, description: 'Chocolate espresso drink', category: 'Beverages', stock: 100 },
    { name: 'Croissant', price: 2.75, description: 'Buttery French pastry', category: 'Pastries', stock: 50 },
    { name: 'Blueberry Muffin', price: 3.25, description: 'Fresh baked muffin', category: 'Pastries', stock: 50 },
    { name: 'Chocolate Chip Cookie', price: 2.00, description: 'Homemade cookie', category: 'Pastries', stock: 75 },
    { name: 'Bagel with Cream Cheese', price: 3.50, description: 'Fresh bagel with cream cheese', category: 'Food', stock: 40 },
    { name: 'Avocado Toast', price: 6.50, description: 'Sourdough toast with avocado', category: 'Food', stock: 30 },
    { name: 'Caesar Salad', price: 8.50, description: 'Fresh romaine with caesar dressing', category: 'Food', stock: 25 },
    { name: 'Chicken Panini', price: 9.50, description: 'Grilled chicken panini', category: 'Food', stock: 20 },
    { name: 'Iced Coffee', price: 3.75, description: 'Cold brew coffee', category: 'Beverages', stock: 80 },
    { name: 'Green Tea', price: 2.50, description: 'Premium green tea', category: 'Beverages', stock: 100 },
    { name: 'Hot Chocolate', price: 3.25, description: 'Rich hot chocolate', category: 'Beverages', stock: 60 },
  ];

  const addSampleProducts = async () => {
    try {
      setLoading(true);
      let added = 0;
      for (const product of sampleCafeProducts) {
        // Check if product already exists
        const exists = products.some(p => p.name.toLowerCase() === product.name.toLowerCase());
        if (!exists) {
          await addProduct(product);
          added++;
        }
      }
      if (added > 0) {
        message.success(`Added ${added} new cafe products!`);
        // Reload products to refresh the list
        setProductsLoading(true);
        await loadProducts();
        setProductsLoading(false);
      } else {
        message.info('All sample products already exist!');
      }
    } catch (error) {
      console.error('Error adding sample products:', error);
      message.error('Failed to add sample products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        await loadProducts();
        console.log('Products loaded:', products.length);
      } catch (error) {
        console.error('Error loading products:', error);
        message.error('Failed to load products');
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [loadProducts]);

  // Debug: Log products when they change
  useEffect(() => {
    console.log('Products updated:', products.length, products);
  }, [products]);

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
    (product) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        product.name?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }
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
      render: (price: number) => formatCurrency(price, currency),
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
        style={{ marginBottom: 16, borderRadius: 12 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
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
              onClick={addSampleProducts}
              loading={loading}
              size="large"
            >
              Add Sample Cafe Products
            </Button>
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

      <Card style={{ borderRadius: 12 }}>
        {!productsLoading && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>
              No products found. Click "Add Sample Cafe Products" to get started!
            </p>
            <Button
              type="primary"
              size="large"
              onClick={addSampleProducts}
              loading={loading}
            >
              Add Sample Cafe Products
            </Button>
          </div>
        )}
        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          loading={productsLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} products`,
          }}
          locale={{
            emptyText: searchQuery 
              ? `No products match "${searchQuery}"`
              : 'No products found'
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
              prefix={getCurrencySymbol(currency)}
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

          <Form.Item 
            name="category" 
            label="Category"
            tooltip="Select a category. Categories marked (Bar) will appear in Bar Display, (Kitchen) in Kitchen Display. You can also type a custom category."
          >
            <Select
              placeholder="Select or type a category"
              size="large"
              showSearch
              allowClear
              filterOption={(input, option) => {
                const label = typeof option?.label === 'string' ? option.label : String(option?.label || '');
                const value = typeof option?.value === 'string' ? option.value : String(option?.value || '');
                return label.toLowerCase().includes(input.toLowerCase()) || 
                       value.toLowerCase().includes(input.toLowerCase());
              }}
              onSearch={(value) => {
                // Allow typing custom values
                if (value && !PRODUCT_CATEGORIES.find(c => c.value.toLowerCase() === value.toLowerCase())) {
                  // Custom value typed, will be accepted when selected
                }
              }}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#999' }}>
                    💡 Tip: Type to search or enter a custom category name
                  </div>
                </>
              )}
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <Option key={cat.value} value={cat.value} label={cat.label}>
                  <Space>
                    <span>{cat.label}</span>
                    {cat.station === 'bar' && <Tag color="blue">Bar</Tag>}
                    {cat.station === 'kitchen' && <Tag color="orange">Kitchen</Tag>}
                  </Space>
                </Option>
              ))}
            </Select>
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

