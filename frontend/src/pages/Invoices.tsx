import { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Typography,
  Space,
  Button,
  Card,
  Modal,
  Descriptions,
  Tag,
  message,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextFilled,
} from '@ant-design/icons';
import db from '../services/database';
import { format } from 'date-fns';
import type { Sale } from '../types';
import usePosStore from '../stores/usePosStore';
import { formatCurrency } from '../utils/currency';

const { Title } = Typography;

export default function Invoices() {
  const { currency } = usePosStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const salesData = (await db.getSales(500)) as Sale[];
      setSales(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
      message.error('Error loading invoices');
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewSale = async (saleId: string) => {
    try {
      const sale = (await db.getSale(saleId)) as Sale;
      setSelectedSale(sale);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading sale:', error);
      message.error('Error loading sale details');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text: string) => (
        <Space>
          <FileTextFilled />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (name: string) => name || <Tag color="default">Walk-in</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : 'N/A'),
      sorter: (a: Sale, b: Sale) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {formatCurrency(amount || 0, currency)}
        </span>
      ),
      sorter: (a: Sale, b: Sale) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string) => {
        const colors: Record<string, string> = {
          cash: 'green',
          card: 'blue',
          upi: 'purple',
          other: 'default',
        };
        return <Tag color={colors[method] || 'default'}>{method?.toUpperCase() || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Sale) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => record.id && handleViewSale(record.id)}
          >
            View
          </Button>
          <Button icon={<DownloadOutlined />} size="small" onClick={handlePrint}>
            Print
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{ marginBottom: 16, borderRadius: 12 }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search invoices..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            allowClear
            size="large"
          />
        </Space>
      </Card>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={filteredSales}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} invoices`,
          }}
        />
      </Card>

      <Modal
        title="Invoice Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="print" icon={<DownloadOutlined />} onClick={handlePrint}>
            Print
          </Button>,
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedSale && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Invoice Number">
                {selectedSale.invoice_number}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {selectedSale.created_at
                  ? format(new Date(selectedSale.created_at), 'MMM dd, yyyy HH:mm')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedSale.customer_name || 'Walk-in Customer'}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <Tag color="blue">{selectedSale.payment_method?.toUpperCase() || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Subtotal">
                {formatCurrency((selectedSale.total_amount || 0) - (selectedSale.tax || 0), currency)}
              </Descriptions.Item>
              <Descriptions.Item label="Tax">
                {formatCurrency(selectedSale.tax || 0, currency)}
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                {formatCurrency(selectedSale.discount || 0, currency)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                  {formatCurrency(selectedSale.total_amount || 0, currency)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {selectedSale.items && selectedSale.items.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Items</Title>
                <Table
                  dataSource={selectedSale.items}
                  columns={[
                    { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
                    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                    {
                      title: 'Price',
                      dataIndex: 'price',
                      key: 'price',
                      render: (price: number) => formatCurrency(price, currency),
                    },
                    {
                      title: 'Total',
                      dataIndex: 'total',
                      key: 'total',
                      render: (total: number) => formatCurrency(total, currency),
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

