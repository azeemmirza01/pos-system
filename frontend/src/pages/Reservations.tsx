import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Space, Typography, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';
import type { Reservation } from '../types';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Reservations() {
  const { currentOutlet, isOnline } = usePosStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOnline) {
      loadReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOutlet, isOnline]);

  const loadReservations = async () => {
    try {
      if (isOnline && currentOutlet) {
        const response = await axios.get(`${API_BASE_URL}/reservations?outlet_id=${currentOutlet.id}`);
        setReservations(response.data);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const handleAdd = () => {
    setEditingReservation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    form.setFieldsValue({
      ...reservation,
      reservation_date: dayjs(reservation.reservation_date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (isOnline) {
        await axios.delete(`${API_BASE_URL}/reservations/${id}`);
        message.success('Reservation deleted successfully');
        loadReservations();
      }
    } catch (error) {
      message.error('Error deleting reservation');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      if (isOnline) {
        await axios.put(`${API_BASE_URL}/reservations/${id}`, { status });
        message.success('Reservation status updated');
        loadReservations();
      }
    } catch (error) {
      message.error('Error updating reservation');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (isOnline) {
        const data = {
          ...values,
          reservation_date: values.reservation_date.format('YYYY-MM-DD'),
          outlet_id: currentOutlet?.id
        };
        if (editingReservation) {
          await axios.put(`${API_BASE_URL}/reservations/${editingReservation.id}`, data);
          message.success('Reservation updated successfully');
        } else {
          await axios.post(`${API_BASE_URL}/reservations`, data);
          message.success('Reservation created successfully');
        }
        setIsModalVisible(false);
        loadReservations();
      }
    } catch (error) {
      message.error('Error saving reservation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'confirmed': return 'blue';
      case 'seated': return 'green';
      case 'completed': return 'cyan';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Phone',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
    },
    {
      title: 'Table',
      dataIndex: 'table_number',
      key: 'table_number',
      render: (text: string) => text ? <Tag color="blue">Table {text}</Tag> : '-',
    },
    {
      title: 'Date',
      dataIndex: 'reservation_date',
      key: 'reservation_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Time',
      dataIndex: 'reservation_time',
      key: 'reservation_time',
    },
    {
      title: 'Guests',
      dataIndex: 'number_of_guests',
      key: 'number_of_guests',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Reservation) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          {record.status === 'pending' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'confirmed')}
            >
              Confirm
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'seated')}
            >
              Seat
            </Button>
          )}
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
        <Title level={2}>Reservations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Reservation
        </Button>
      </Space>

      <Card>
        <Table
          dataSource={reservations}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingReservation ? 'Edit Reservation' : 'Add Reservation'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="customer_name" label="Customer Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customer_phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="reservation_date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reservation_time" label="Time" rules={[{ required: true }]}>
            <Input placeholder="HH:MM" />
          </Form.Item>
          <Form.Item name="number_of_guests" label="Number of Guests" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="table_id" label="Table">
            <Select placeholder="Select table">
              {/* Tables will be loaded from store */}
            </Select>
          </Form.Item>
          <Form.Item name="special_requests" label="Special Requests">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

