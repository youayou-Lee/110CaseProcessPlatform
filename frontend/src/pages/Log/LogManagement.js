import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  DatePicker,
  Select,
  Input,
  Tag,
  Modal,
  Descriptions,
  Row,
  Col,
  Tabs,
  message
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { logApi } from '../../api/log';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const LogManagement = () => {
  const [loading, setLoading] = useState(false);
  const [operationLogs, setOperationLogs] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);
  const [searchParams, setSearchParams] = useState({
    startTime: null,
    endTime: null,
    type: null,
    keyword: '',
  });

  // 获取操作日志
  const fetchOperationLogs = async () => {
    setLoading(true);
    try {
      const response = await logApi.getOperationLogs(searchParams);
      setOperationLogs(response);
    } catch (error) {
      message.error('获取操作日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取登录日志
  const fetchLoginLogs = async () => {
    setLoading(true);
    try {
      const response = await logApi.getLoginLogs(searchParams);
      setLoginLogs(response);
    } catch (error) {
      message.error('获取登录日志失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationLogs();
    fetchLoginLogs();
  }, [searchParams]);

  // 处理搜索
  const handleSearch = (values) => {
    setSearchParams({
      ...searchParams,
      ...values,
    });
  };

  // 导出日志
  const handleExport = async (type) => {
    try {
      await logApi.exportLogs(type, searchParams);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 清空日志
  const handleClear = async (type) => {
    try {
      await logApi.clearLogs(type);
      message.success('清空成功');
      if (type === 'operation') {
        fetchOperationLogs();
      } else {
        fetchLoginLogs();
      }
    } catch (error) {
      message.error('清空失败');
    }
  };

  // 操作日志列定义
  const operationColumns = [
    {
      title: '操作时间',
      dataIndex: 'operate_time',
      key: 'operate_time',
      render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeMap = {
          create: { color: 'green', text: '新增' },
          update: { color: 'blue', text: '修改' },
          delete: { color: 'red', text: '删除' },
          export: { color: 'orange', text: '导出' },
          import: { color: 'purple', text: '导入' },
        };
        const { color, text } = typeMap[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '操作模块',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: '操作内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '操作状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentLog(record);
              setDetailVisible(true);
            }}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 登录日志列定义
  const loginColumns = [
    {
      title: '登录时间',
      dataIndex: 'login_time',
      key: 'login_time',
      render: (time) => moment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '登录IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '登录地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
    },
    {
      title: '登录状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentLog(record);
              setDetailVisible(true);
            }}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Tabs defaultActiveKey="operation">
          <TabPane tab="操作日志" key="operation">
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <RangePicker
                    showTime
                    onChange={(dates) => handleSearch({
                      startTime: dates?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
                      endTime: dates?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
                    })}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="操作类型"
                    allowClear
                    onChange={(value) => handleSearch({ type: value })}
                  >
                    <Option value="create">新增</Option>
                    <Option value="update">修改</Option>
                    <Option value="delete">删除</Option>
                    <Option value="export">导出</Option>
                    <Option value="import">导入</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="搜索关键词"
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearch({ keyword: e.target.value })}
                  />
                </Col>
                <Col span={8}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleExport('operation')}
                    >
                      导出
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleClear('operation')}
                    >
                      清空
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchOperationLogs}
                    >
                      刷新
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
            <Table
              columns={operationColumns}
              dataSource={operationLogs}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
          <TabPane tab="登录日志" key="login">
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <RangePicker
                    showTime
                    onChange={(dates) => handleSearch({
                      startTime: dates?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
                      endTime: dates?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
                    })}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="登录状态"
                    allowClear
                    onChange={(value) => handleSearch({ status: value })}
                  >
                    <Option value="success">成功</Option>
                    <Option value="failed">失败</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="搜索用户名/IP"
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearch({ keyword: e.target.value })}
                  />
                </Col>
                <Col span={8}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleExport('login')}
                    >
                      导出
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleClear('login')}
                    >
                      清空
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchLoginLogs}
                    >
                      刷新
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
            <Table
              columns={loginColumns}
              dataSource={loginLogs}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="日志详情"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        <Descriptions bordered column={2}>
          {currentLog?.type === 'operation' ? (
            <>
              <Descriptions.Item label="操作时间">
                {moment(currentLog?.operate_time).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="操作类型">
                {currentLog?.type}
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                {currentLog?.operator}
              </Descriptions.Item>
              <Descriptions.Item label="操作模块">
                {currentLog?.module}
              </Descriptions.Item>
              <Descriptions.Item label="操作内容" span={2}>
                {currentLog?.content}
              </Descriptions.Item>
              <Descriptions.Item label="操作状态">
                {currentLog?.status}
              </Descriptions.Item>
              <Descriptions.Item label="IP地址">
                {currentLog?.ip}
              </Descriptions.Item>
              <Descriptions.Item label="错误信息" span={2}>
                {currentLog?.error_message}
              </Descriptions.Item>
            </>
          ) : (
            <>
              <Descriptions.Item label="登录时间">
                {moment(currentLog?.login_time).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="用户名">
                {currentLog?.username}
              </Descriptions.Item>
              <Descriptions.Item label="登录IP">
                {currentLog?.ip}
              </Descriptions.Item>
              <Descriptions.Item label="登录地点">
                {currentLog?.location}
              </Descriptions.Item>
              <Descriptions.Item label="浏览器">
                {currentLog?.browser}
              </Descriptions.Item>
              <Descriptions.Item label="操作系统">
                {currentLog?.os}
              </Descriptions.Item>
              <Descriptions.Item label="登录状态">
                {currentLog?.status}
              </Descriptions.Item>
              <Descriptions.Item label="错误信息" span={2}>
                {currentLog?.error_message}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Modal>
    </div>
  );
};

export default LogManagement; 