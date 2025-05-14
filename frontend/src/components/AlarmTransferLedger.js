// frontend/src/components/AlarmTransferLedger.js
import React, { useState } from 'react';
import { Card, Table, Form, Input, DatePicker, Select, Button, Space, Timeline, Modal, Tag } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

function AlarmTransferLedger() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 处理搜索
  const handleSearch = (values) => {
    console.log('搜索条件:', values);
    setLoading(true);
    // TODO: 调用API获取数据
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // 处理导出
  const handleExport = () => {
    console.log('导出数据');
    message.success('数据导出成功');
  };

  // 处理打印
  const handlePrint = () => {
    console.log('打印数据');
    window.print();
  };

  // 查看详情
  const showDetail = (record) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '警情编号',
      dataIndex: 'alarmNumber',
      key: 'alarmNumber',
      width: 150,
    },
    {
      title: '警情类型',
      dataIndex: 'alarmType',
      key: 'alarmType',
      width: 120,
    },
    {
      title: '报警时间',
      dataIndex: 'alarmTime',
      key: 'alarmTime',
      width: 180,
      sorter: true,
    },
    {
      title: '当前环节',
      dataIndex: 'currentStep',
      key: 'currentStep',
      width: 120,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          processing: { color: 'blue', text: '处理中' },
          completed: { color: 'green', text: '已完成' },
          timeout: { color: 'red', text: '已超时' },
        };
        const { color, text } = statusConfig[status] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  // 模拟流转记录数据
  const transferRecords = [
    {
      time: '2024-01-01 10:00:00',
      step: '接警登记',
      operator: '张三',
      content: '完成警情信息登记',
      status: 'completed',
    },
    {
      time: '2024-01-01 10:05:00',
      step: '警情研判',
      operator: '李四',
      content: '确认为一般警情',
      status: 'completed',
    },
    {
      time: '2024-01-01 10:10:00',
      step: '警情下发',
      operator: '王五',
      content: '下发至海淀分局处警',
      status: 'completed',
    },
    {
      time: '2024-01-01 10:15:00',
      step: '处警反馈',
      operator: '赵六',
      content: '民警已到达现场处置',
      status: 'processing',
    },
  ];

  return (
    <div className="alarm-transfer-ledger">
      <Card bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="dateRange"
                label="时间范围"
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="alarmNumber"
                label="警情编号"
              >
                <Input placeholder="请输入警情编号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="alarmType"
                label="警情类型"
              >
                <Select placeholder="请选择警情类型">
                  <Option value="criminal">刑事警情</Option>
                  <Option value="security">治安警情</Option>
                  <Option value="traffic">交通警情</Option>
                  <Option value="fire">火警</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="status"
                label="处理状态"
              >
                <Select placeholder="请选择处理状态">
                  <Option value="processing">处理中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="timeout">已超时</Option>
                </Select>
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
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                  导出
                </Button>
                <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                  打印
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="警情流转详情"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="警情编号">{selectedRecord.alarmNumber}</Descriptions.Item>
              <Descriptions.Item label="警情类型">{selectedRecord.alarmType}</Descriptions.Item>
              <Descriptions.Item label="报警时间">{selectedRecord.alarmTime}</Descriptions.Item>
              <Descriptions.Item label="当前状态">{selectedRecord.status}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h3>流转记录</h3>
              <Timeline>
                {transferRecords.map((record, index) => (
                  <Timeline.Item
                    key={index}
                    color={record.status === 'completed' ? 'green' : 'blue'}
                  >
                    <p><strong>{record.step}</strong></p>
                    <p>操作人：{record.operator}</p>
                    <p>操作内容：{record.content}</p>
                    <p style={{ color: '#999' }}>{record.time}</p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default AlarmTransferLedger;