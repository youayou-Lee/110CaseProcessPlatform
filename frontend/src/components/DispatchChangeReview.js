// frontend/src/components/DispatchChangeReview.js
import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, Timeline, message } from 'antd';
import { CheckOutlined, CloseOutlined, UserSwitchOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

function DispatchChangeReview() {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [reviewType, setReviewType] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 模拟变更申请数据
  const [data, setData] = useState([
    {
      key: '1',
      requestId: 'BG202401010001',
      alarmNumber: 'AJ202401010001',
      originalUnit: '中关村派出所',
      newUnit: '万寿路派出所',
      reason: '就近处警',
      requestTime: '2024-01-01 10:00:00',
      status: 'pending',
      requestUser: '张三',
    },
  ]);

  // 处理审核操作
  const handleReview = (record, type) => {
    setSelectedRecord(record);
    setReviewType(type);
    setVisible(true);
  };

  // 提交审核结果
  const handleSubmit = (values) => {
    console.log('审核结果:', { ...values, type: reviewType });
    
    // 更新申请状态
    const newData = data.map(item => {
      if (item.key === selectedRecord.key) {
        return {
          ...item,
          status: reviewType === 'approve' ? 'approved' : 'rejected',
        };
      }
      return item;
    });
    
    setData(newData);
    message.success('审核操作已完成');
    setVisible(false);
    form.resetFields();
  };

  // 表格列定义
  const columns = [
    {
      title: '申请编号',
      dataIndex: 'requestId',
      key: 'requestId',
      width: 150,
    },
    {
      title: '警情编号',
      dataIndex: 'alarmNumber',
      key: 'alarmNumber',
      width: 150,
    },
    {
      title: '原处警单位',
      dataIndex: 'originalUnit',
      key: 'originalUnit',
      width: 150,
    },
    {
      title: '新处警单位',
      dataIndex: 'newUnit',
      key: 'newUnit',
      width: 150,
    },
    {
      title: '申请人',
      dataIndex: 'requestUser',
      key: 'requestUser',
      width: 100,
    },
    {
      title: '申请时间',
      dataIndex: 'requestTime',
      key: 'requestTime',
      width: 180,
    },
    {
      title: '变更原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          pending: { color: 'gold', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已驳回' },
          transferred: { color: 'blue', text: '已转审' },
        };
        const { color, text } = statusConfig[status] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        record.status === 'pending' && (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleReview(record, 'approve')}
            >
              同意
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReview(record, 'reject')}
            >
              驳回
            </Button>
            <Button
              icon={<UserSwitchOutlined />}
              onClick={() => handleReview(record, 'transfer')}
            >
              转审
            </Button>
          </Space>
        )
      ),
    },
  ];

  // 获取模态框标题
  const getModalTitle = () => {
    const titleMap = {
      approve: '同意变更申请',
      reject: '驳回变更申请',
      transfer: '转审变更申请',
    };
    return titleMap[reviewType] || '审核';
  };

  return (
    <div className="dispatch-change-review">
      <Card title="派警变更审核" bordered={false}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={getModalTitle()}
        visible={visible}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          {reviewType === 'transfer' ? (
            <Form.Item
              name="transferTo"
              label="转审人"
              rules={[{ required: true, message: '请选择转审人' }]}
            >
              <Select placeholder="请选择转审人">
                <Option value="user1">李四</Option>
                <Option value="user2">王五</Option>
                <Option value="user3">赵六</Option>
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="comment"
              label="审核意见"
              rules={[{ required: true, message: '请输入审核意见' }]}
            >
              <TextArea rows={4} placeholder="请输入审核意见" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认</Button>
              <Button onClick={() => {
                setVisible(false);
                form.resetFields();
              }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default DispatchChangeReview;