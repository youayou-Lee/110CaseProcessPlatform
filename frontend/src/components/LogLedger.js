// frontend/src/components/LogLedger.js
import React, { useState } from 'react';
import { Card, Table, Form, Input, DatePicker, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, DownloadOutlined, PlayCircleOutlined, DownloadOutlined as DownloadAudioOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

function LogLedger() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // 处理搜索
  const handleSearch = (values) => {
    console.log('搜索条件:', values);
    setLoading(true);
    // TODO: 调用API获取数据
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // 处理录音播放
  const handlePlayAudio = (record) => {
    console.log('播放录音:', record);
    // TODO: 实现录音播放功能
  };

  // 处理录音下载
  const handleDownloadAudio = (record) => {
    console.log('下载录音:', record);
    // TODO: 实现录音下载功能
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: '来电号码',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 120,
    },
    {
      title: '归属地',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
      sorter: true,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
    },
    {
      title: '通话时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      sorter: true,
    },
    {
      title: '警情编号',
      dataIndex: 'alarmNumber',
      key: 'alarmNumber',
      width: 120,
    },
    {
      title: '警情关联状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
    },
    {
      title: '录音操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePlayAudio(record)}
          >
            播放
          </Button>
          <Button
            type="link"
            icon={<DownloadAudioOutlined />}
            onClick={() => handleDownloadAudio(record)}
          >
            下载
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <Card bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dateRange"
                label="日期范围"
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phoneNumber"
                label="报警号码"
              >
                <Input placeholder="请输入报警号码" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="alarmNumber"
                label="警情编号"
              >
                <Input placeholder="请输入警情编号" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  查询
                </Button>
                <Button onClick={() => form.resetFields()}>重置</Button>
                <Button type="primary" icon={<DownloadOutlined />}>
                  导出数据
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1300 }}
          pagination={{
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
}

export default LogLedger;