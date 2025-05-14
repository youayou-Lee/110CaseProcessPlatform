// frontend/src/components/DispatchTicketManagement.js
import React, { useState } from 'react';
import { Card, Table, Form, Input, Select, Button, Space, Row, Col, Modal, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

function DispatchTicketManagement() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // 处理搜索
  const handleSearch = (values) => {
    console.log('搜索条件:', values);
    setLoading(true);
    // TODO: 调用API获取数据
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // 处理创建/编辑派警单
  const handleSubmit = (values) => {
    console.log('提交的表单数据:', values);
    if (editingRecord) {
      // TODO: 调用API更新派警单
      message.success('派警单更新成功');
    } else {
      // TODO: 调用API创建派警单
      message.success('派警单创建成功');
    }
    setVisible(false);
    form.resetFields();
    setEditingRecord(null);
  };

  // 打开编辑模态框
  const showEditModal = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setVisible(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '派警单号',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      width: 120,
    },
    {
      title: '警情编号',
      dataIndex: 'alarmNumber',
      key: 'alarmNumber',
      width: 120,
    },
    {
      title: '派警类型',
      dataIndex: 'dispatchType',
      key: 'dispatchType',
      width: 100,
    },
    {
      title: '处警单位',
      dataIndex: 'policeUnit',
      key: 'policeUnit',
      width: 150,
    },
    {
      title: '处警人员',
      dataIndex: 'policeOfficers',
      key: 'policeOfficers',
      width: 150,
    },
    {
      title: '派警时间',
      dataIndex: 'dispatchTime',
      key: 'dispatchTime',
      width: 180,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          pending: { color: 'gold', text: '待处理' },
          processing: { color: 'blue', text: '处理中' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: '未知' };
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
          icon={<EditOutlined />}
          onClick={() => showEditModal(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div className="page-content">
      <Card bordered={false}>
        <Form
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="ticketNumber"
                label="派警单号"
              >
                <Input placeholder="请输入派警单号" />
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
                name="status"
                label="状态"
              >
                <Select placeholder="请选择状态">
                  <Option value="pending">待处理</Option>
                  <Option value="processing">处理中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="cancelled">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ textAlign: 'right', marginTop: 29 }}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  查询
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingRecord(null);
                    form.resetFields();
                    setVisible(true);
                  }}
                >
                  新建派警单
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="ticketNumber"
          scroll={{ x: 1200 }}
          pagination={{
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />

        <Modal
          title={editingRecord ? '编辑派警单' : '新建派警单'}
          visible={visible}
          onCancel={() => {
            setVisible(false);
            form.resetFields();
            setEditingRecord(null);
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="alarmNumber"
                  label="警情编号"
                  rules={[{ required: true, message: '请输入警情编号' }]}
                >
                  <Input placeholder="请输入警情编号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dispatchType"
                  label="派警类型"
                  rules={[{ required: true, message: '请选择派警类型' }]}
                >
                  <Select placeholder="请选择派警类型">
                    <Option value="normal">常规派警</Option>
                    <Option value="emergency">紧急派警</Option>
                    <Option value="support">增援派警</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="policeUnit"
                  label="处警单位"
                  rules={[{ required: true, message: '请选择处警单位' }]}
                >
                  <Select placeholder="请选择处警单位">
                    <Option value="unit1">派出所一</Option>
                    <Option value="unit2">派出所二</Option>
                    <Option value="unit3">特警大队</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="policeOfficers"
                  label="处警人员"
                  rules={[{ required: true, message: '请选择处警人员' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="请选择处警人员"
                  >
                    <Option value="officer1">警员一</Option>
                    <Option value="officer2">警员二</Option>
                    <Option value="officer3">警员三</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="remarks"
              label="备注"
            >
              <TextArea rows={4} placeholder="请输入备注信息" />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => {
                  setVisible(false);
                  form.resetFields();
                  setEditingRecord(null);
                }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  确定
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

export default DispatchTicketManagement;