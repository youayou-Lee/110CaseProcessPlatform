import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Input, DatePicker, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { alarmApi } from '../../api/alarm';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;

const AlarmRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const navigate = useNavigate();

  // 获取警情记录列表
  const fetchRecords = async (params = {}) => {
    setLoading(true);
    try {
      const response = await alarmApi.getAlarmRecords({
        page: currentPage,
        page_size: pageSize,
        ...params
      });
      setRecords(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('获取警情记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [currentPage, pageSize]);

  // 表格列定义
  const columns = [
    {
      title: '警情编号',
      dataIndex: 'alarm_number',
      key: 'alarm_number',
    },
    {
      title: '警情类型',
      dataIndex: 'alarm_type',
      key: 'alarm_type',
      render: (type) => (
        <Tag color={type === 'emergency' ? 'red' : 'blue'}>
          {type === 'emergency' ? '紧急' : '普通'}
        </Tag>
      ),
    },
    {
      title: '报警时间',
      dataIndex: 'alarm_time',
      key: 'alarm_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '报警人',
      dataIndex: 'caller_name',
      key: 'caller_name',
    },
    {
      title: '联系电话',
      dataIndex: 'caller_phone',
      key: 'caller_phone',
    },
    {
      title: '警情地址',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待处理' },
          processing: { color: 'blue', text: '处理中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleView(record)}>查看</Button>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
        </Space>
      ),
    },
  ];

  // 搜索处理
  const handleSearch = (values) => {
    const params = {};
    if (values.alarm_number) params.alarm_number = values.alarm_number;
    if (values.alarm_type) params.alarm_type = values.alarm_type;
    if (values.status) params.status = values.status;
    if (values.time_range) {
      params.start_time = values.time_range[0].format('YYYY-MM-DD HH:mm:ss');
      params.end_time = values.time_range[1].format('YYYY-MM-DD HH:mm:ss');
    }
    fetchRecords(params);
  };

  // 创建警情记录
  const handleCreate = async (values) => {
    try {
      await alarmApi.createAlarmRecord(values);
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchRecords();
    } catch (error) {
      console.error('创建警情记录失败:', error);
    }
  };

  // 查看警情详情
  const handleView = (record) => {
    navigate(`/alarm/records/${record.id}`);
  };

  // 编辑警情记录
  const handleEdit = (record) => {
    // TODO: 实现编辑功能
  };

  return (
    <div>
      <Card>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 24 }}
        >
          <Form.Item name="alarm_number">
            <Input placeholder="警情编号" prefix={<SearchOutlined />} />
          </Form.Item>
          <Form.Item name="alarm_type">
            <Select
              placeholder="警情类型"
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="emergency">紧急</Select.Option>
              <Select.Option value="normal">普通</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="processing">处理中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="time_range">
            <RangePicker showTime />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Form.Item>
        </Form>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          style={{ marginBottom: 16 }}
        >
          新建警情
        </Button>

        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title="新建警情"
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="alarm_type"
            label="警情类型"
            rules={[{ required: true, message: '请选择警情类型' }]}
          >
            <Select>
              <Select.Option value="emergency">紧急</Select.Option>
              <Select.Option value="normal">普通</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="caller_name"
            label="报警人"
            rules={[{ required: true, message: '请输入报警人姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="caller_phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label="警情地址"
            rules={[{ required: true, message: '请输入警情地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="警情描述"
            rules={[{ required: true, message: '请输入警情描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlarmRecordList; 