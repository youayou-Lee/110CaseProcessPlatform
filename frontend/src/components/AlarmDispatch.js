// frontend/src/components/AlarmDispatch.js
import React, { useState } from 'react';
import { Card, Tree, Form, Input, Button, Space, Table, Tag, Modal, message } from 'antd';
import { SendOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

function AlarmDispatch({ alarmId }) {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [dispatchRecords, setDispatchRecords] = useState([]);

  // 模拟单位树数据
  const treeData = [
    {
      title: '市局',
      key: 'city',
      children: [
        {
          title: '海淀分局',
          key: 'haidian',
          children: [
            {
              title: '中关村派出所',
              key: 'zhongguancun',
            },
            {
              title: '万寿路派出所',
              key: 'wanshoulu',
            },
          ],
        },
        {
          title: '朝阳分局',
          key: 'chaoyang',
          children: [
            {
              title: '建外派出所',
              key: 'jianwai',
            },
            {
              title: '三里屯派出所',
              key: 'sanlitun',
            },
          ],
        },
      ],
    },
  ];

  // 处理单位选择
  const handleUnitSelect = (selectedKeys, info) => {
    setSelectedUnits(selectedKeys);
  };

  // 处理警情下发
  const handleDispatch = (values) => {
    if (selectedUnits.length === 0) {
      message.error('请选择下发单位');
      return;
    }

    const newRecord = {
      key: Date.now(),
      units: selectedUnits.join(', '),
      time: new Date().toLocaleString(),
      status: 'pending',
      remark: values.remark,
    };

    setDispatchRecords([newRecord, ...dispatchRecords]);
    message.success('警情下发成功');
    setVisible(false);
    form.resetFields();
    setSelectedUnits([]);
  };

  // 表格列定义
  const columns = [
    {
      title: '下发时间',
      dataIndex: 'time',
      key: 'time',
      width: 180,
    },
    {
      title: '下发单位',
      dataIndex: 'units',
      key: 'units',
      width: 200,
    },
    {
      title: '接收状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          pending: { color: 'gold', text: '待接收' },
          received: { color: 'green', text: '已接收' },
          processing: { color: 'blue', text: '处理中' },
        };
        const { color, text } = statusConfig[status] || { color: 'default', text: '未知' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '备注说明',
      dataIndex: 'remark',
      key: 'remark',
      width: 300,
    },
  ];

  return (
    <div className="alarm-dispatch">
      <Card
        title="警情下发"
        extra={
          <Button type="primary" icon={<SendOutlined />} onClick={() => setVisible(true)}>
            下发警情
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dispatchRecords}
          pagination={false}
          scroll={{ y: 400 }}
        />
      </Card>

      <Modal
        title="下发警情"
        visible={visible}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
          setSelectedUnits([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={handleDispatch}
          layout="vertical"
        >
          <Form.Item
            label="选择下发单位"
            required
          >
            <Tree
              checkable
              onCheck={handleUnitSelect}
              treeData={treeData}
              height={300}
            />
          </Form.Item>

          <Form.Item
            name="remark"
            label="下发说明"
            rules={[{ required: true, message: '请输入下发说明' }]}
          >
            <TextArea rows={4} placeholder="请输入下发说明" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认下发</Button>
              <Button onClick={() => {
                setVisible(false);
                form.resetFields();
                setSelectedUnits([]);
              }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AlarmDispatch;