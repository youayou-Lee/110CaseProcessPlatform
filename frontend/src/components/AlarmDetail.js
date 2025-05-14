// frontend/src/components/AlarmDetail.js
import React, { useState } from 'react';
import { Card, Descriptions, Timeline, Button, Modal, Form, Input, Select, Space, Tag, message } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

function AlarmDetail({ alarmId }) {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('processing'); // 警情处理状态

  // 模拟警情数据
  const alarmData = {
    alarmNumber: 'AJ202401010001',
    callNumber: '110',
    callerName: '张三',
    location: '北京市海淀区中关村大街1号',
    alarmType: '治安警情',
    description: '发现可疑人员在小区内徘徊',
    createTime: '2024-01-01 10:00:00',
    status: '处理中',
  };

  // 模拟流转记录数据
  const transferRecords = [
    {
      time: '2024-01-01 10:00:00',
      title: '接警登记',
      content: '接警员小王完成警情信息登记',
      status: 'success',
    },
    {
      time: '2024-01-01 10:05:00',
      title: '警情下发',
      content: '已下发至海淀分局处警',
      status: 'success',
    },
    {
      time: '2024-01-01 10:10:00',
      title: '处警反馈',
      content: '民警已到达现场处置',
      status: 'process',
    },
  ];

  // 处理状态更新
  const handleStatusUpdate = (values) => {
    console.log('状态更新:', values);
    setProcessingStatus(values.status);
    message.success('状态更新成功');
    setVisible(false);
  };

  // 渲染状态标签
  const renderStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'gold', text: '待处理' },
      processing: { color: 'blue', text: '处理中' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
    };
    const { color, text } = statusConfig[status] || { color: 'default', text: '未知' };
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    <div className="alarm-detail">
      <Card title="警情详情" extra={
        <Button type="primary" onClick={() => setVisible(true)}>更新状态</Button>
      }>
        <Descriptions bordered>
          <Descriptions.Item label="警情编号">{alarmData.alarmNumber}</Descriptions.Item>
          <Descriptions.Item label="报警电话">{alarmData.callNumber}</Descriptions.Item>
          <Descriptions.Item label="报警人">{alarmData.callerName}</Descriptions.Item>
          <Descriptions.Item label="事发地点">{alarmData.location}</Descriptions.Item>
          <Descriptions.Item label="警情类型">{alarmData.alarmType}</Descriptions.Item>
          <Descriptions.Item label="报警时间">{alarmData.createTime}</Descriptions.Item>
          <Descriptions.Item label="当前状态">{renderStatusTag(processingStatus)}</Descriptions.Item>
          <Descriptions.Item label="警情描述" span={3}>{alarmData.description}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="警情流转记录" style={{ marginTop: 16 }}>
        <Timeline>
          {transferRecords.map((record, index) => (
            <Timeline.Item
              key={index}
              color={record.status === 'success' ? 'green' : 'blue'}
              dot={record.status === 'success' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            >
              <p><strong>{record.title}</strong></p>
              <p>{record.content}</p>
              <p style={{ color: '#999' }}>{record.time}</p>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      <Modal
        title="更新警情状态"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleStatusUpdate}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="处理状态"
            rules={[{ required: true, message: '请选择处理状态' }]}
          >
            <Select placeholder="请选择处理状态">
              <Option value="pending">待处理</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="remark"
            label="状态说明"
          >
            <TextArea rows={4} placeholder="请输入状态更新说明" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认</Button>
              <Button onClick={() => setVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AlarmDetail;