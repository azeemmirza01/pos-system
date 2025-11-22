import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  InputNumber,
  Modal,
  Form,
  Space,
  message,
  Popconfirm,
  Card,
  Tag,
  Checkbox,
  Select,
} from 'antd';
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  StarOutlined,
  SendOutlined,
} from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Customer } from '../types';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';


export default function Customers() {
  const store = usePosStore();
  const customers = store.customers || [];
  const currency = usePosStore((state) => state.currency) || 'USD';
  const { addCustomer, updateCustomer, deleteCustomer, loadCustomers } = store;
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const [smsForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
  );

  const handleOpenModal = (customer: Customer | null = null) => {
    if (customer) {
      setEditingCustomer(customer);
      form.setFieldsValue({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        loyalty_points: customer.loyalty_points || 0,
        sms_opt_in: customer.sms_opt_in || false,
        email_opt_in: customer.email_opt_in || false,
        tags: customer.tags || [],
        notes: customer.notes || '',
      });
    } else {
      setEditingCustomer(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, values);
        message.success('Customer updated successfully');
      } else {
        await addCustomer(values);
        message.success('Customer added successfully');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving customer:', error);
      message.error('Error saving customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      message.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error('Error deleting customer. Please try again.');
    }
  };

  const handleSendSMS = async () => {
    try {
      setSmsLoading(true);
      const values = await smsForm.validateFields();
      
      const response = await axios.post(`${API_BASE_URL}/customers/send-sms`, {
        message: values.message,
        customer_ids: values.customer_ids || undefined,
        filter: values.filter || undefined
      });
      
      message.success(`SMS queued for ${response.data.total_recipients} customers`);
      setIsSmsModalOpen(false);
      smsForm.resetFields();
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error sending SMS';
      message.error(errorMessage);
    } finally {
      setSmsLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Space>
          <TeamOutlined />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) =>
        email ? (
          <Space>
            <MailOutlined />
            <span>{email}</span>
          </Space>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) =>
        phone ? (
          <Space>
            <PhoneOutlined />
            <span>{phone}</span>
          </Space>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => address || <Tag color="default">N/A</Tag>,
    },
    {
      title: 'Loyalty Points',
      dataIndex: 'loyalty_points',
      key: 'loyalty_points',
      render: (points: number) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <span>{points || 0}</span>
        </Space>
      ),
    },
    {
      title: 'Total Spent',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (spent: number) => formatCurrency(spent || 0, currency),
    },
    {
      title: 'Marketing',
      key: 'marketing',
      render: (_: any, record: Customer) => (
        <Space>
          {record.sms_opt_in && <Tag color="green" icon={<MessageOutlined />}>SMS</Tag>}
          {record.email_opt_in && <Tag color="blue" icon={<MailOutlined />}>Email</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Customer) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this customer?"
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
              placeholder="Search customers..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
              allowClear
              size="large"
            />
            <Button
              type="default"
              icon={<SendOutlined />}
              onClick={() => setIsSmsModalOpen(true)}
              size="large"
            >
              Send SMS Marketing
            </Button>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => handleOpenModal(null)}
              size="large"
            >
              Add Customer
            </Button>
          </Space>
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} customers`,
          }}
        />
      </Card>

      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={editingCustomer ? 'Update' : 'Add'}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="Enter customer name" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="Enter email address" size="large" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="Enter phone number" size="large" />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input.TextArea placeholder="Enter address" rows={3} size="large" />
          </Form.Item>
          <Form.Item name="loyalty_points" label="Loyalty Points" initialValue={0}>
            <InputNumber min={0} placeholder="Loyalty points" style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Form.Item name="sms_opt_in" label="SMS Marketing" valuePropName="checked">
            <Checkbox>Enable SMS Marketing</Checkbox>
          </Form.Item>
          <Form.Item name="email_opt_in" label="Email Marketing" valuePropName="checked">
            <Checkbox>Enable Email Marketing</Checkbox>
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Input placeholder="Comma-separated tags" size="large" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea placeholder="Customer notes" rows={3} size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* SMS Marketing Modal */}
      <Modal
        title="Send SMS Marketing"
        open={isSmsModalOpen}
        onCancel={() => {
          setIsSmsModalOpen(false);
          smsForm.resetFields();
        }}
        onOk={handleSendSMS}
        confirmLoading={smsLoading}
        okText="Send SMS"
        cancelText="Cancel"
        width={600}
      >
        <Form form={smsForm} layout="vertical">
          <Form.Item
            name="message"
            label="SMS Message"
            rules={[{ required: true, message: 'Please enter SMS message' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter your marketing message here..."
              maxLength={160}
              showCount
            />
          </Form.Item>
          <Form.Item
            name="customer_ids"
            label="Select Customers (Optional - leave empty to send to all opted-in customers)"
          >
            <Select
              mode="multiple"
              placeholder="Select specific customers or leave empty for all"
              showSearch
              filterOption={(input: string, option: any) =>
                String(option?.label || "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers
                .filter(c => c.sms_opt_in && c.phone)
                .map((customer) => (
                  <Select.Option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Tag color="blue">
              {customers.filter(c => c.sms_opt_in && c.phone).length} customers opted in for SMS
            </Tag>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

