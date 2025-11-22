import { useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  Divider,
  message,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  SyncOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import usePosStore from '../stores/usePosStore';

const { Text } = Typography;

export default function Settings() {
  const { isOnline, sync, syncStatus } = usePosStore();
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('apiUrl') || 'http://localhost:3000/api'
  );
  const [loading, setLoading] = useState(false);

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
    </div>
  );
}

