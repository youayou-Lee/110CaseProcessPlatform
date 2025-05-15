import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  TreeSelect,
  message,
  Tag,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { dispatchApi } from '../../api/alarm';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const DispatchManagement = () => {
  const [units, setUnits] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [currentDispatch, setCurrentDispatch] = useState(null);
  const [unitForm] = Form.useForm();
  const [dispatchForm] = Form.useForm();

  // 获取派警单位列表
  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await dispatchApi.getUnits();
      setUnits(response);
    } catch (error) {
      message.error('获取派警单位列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取派警记录列表
  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const response = await dispatchApi.getDispatches();
      setDispatches(response);
    } catch (error) {
      message.error('获取派警记录列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchDispatches();
  }, []);

  // 处理派警单位表单提交
  const handleUnitSubmit = async (values) => {
    try {
      if (currentUnit) {
        await dispatchApi.updateUnit(currentUnit.id, values);
        message.success('更新派警单位成功');
      } else {
        await dispatchApi.createUnit(values);
        message.success('创建派警单位成功');
      }
      setUnitModalVisible(false);
      unitForm.resetFields();
      fetchUnits();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 处理派警记录表单提交
  const handleDispatchSubmit = async (values) => {
    try {
      if (currentDispatch) {
        await dispatchApi.updateDispatch(currentDispatch.id, values);
        message.success('更新派警记录成功');
      } else {
        await dispatchApi.createDispatch(values);
        message.success('创建派警记录成功');
      }
      setDispatchModalVisible(false);
      dispatchForm.resetFields();
      fetchDispatches();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 删除派警单位
  const handleDeleteUnit = async (id) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个派警单位吗？',
      onOk: async () => {
        try {
          await dispatchApi.deleteUnit(id);
          message.success('删除成功');
          fetchUnits();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 更新派警状态
  const handleUpdateDispatchStatus = async (id, status) => {
    try {
      await dispatchApi.updateDispatchStatus(id, status);
      message.success('更新状态成功');
      fetchDispatches();
    } catch (error) {
      message.error('更新状态失败');
    }
  };

  // 派警单位表格列定义
  const unitColumns = [
    {
      title: '单位名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '单位类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'police' ? 'blue' : 'green'}>
          {type === 'police' ? '警局' : '其他'}
        </Tag>
      ),
    },
    {
      title: '上级单位',
      dataIndex: 'parent_name',
      key: 'parent_name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '停用'}
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
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentUnit(record);
              unitForm.setFieldsValue(record);
              setUnitModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUnit(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 派警记录表格列定义
  const dispatchColumns = [
    {
      title: '派警编号',
      dataIndex: 'dispatch_number',
      key: 'dispatch_number',
    },
    {
      title: '警情编号',
      dataIndex: 'alarm_number',
      key: 'alarm_number',
    },
    {
      title: '派警单位',
      dataIndex: 'unit_name',
      key: 'unit_name',
    },
    {
      title: '派警时间',
      dataIndex: 'dispatch_time',
      key: 'dispatch_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
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
          <Button
            type="link"
            onClick={() => {
              setCurrentDispatch(record);
              dispatchForm.setFieldsValue(record);
              setDispatchModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Select
            style={{ width: 100 }}
            value={record.status}
            onChange={(value) => handleUpdateDispatchStatus(record.id, value)}
          >
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="completed">已完成</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="派警单位管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentUnit(null);
              unitForm.resetFields();
              setUnitModalVisible(true);
            }}
          >
            新建单位
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={unitColumns}
          dataSource={units}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Card
        title="派警记录管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentDispatch(null);
              dispatchForm.resetFields();
              setDispatchModalVisible(true);
            }}
          >
            新建派警
          </Button>
        }
      >
        <Table
          columns={dispatchColumns}
          dataSource={dispatches}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* 派警单位表单模态框 */}
      <Modal
        title={currentUnit ? '编辑派警单位' : '新建派警单位'}
        visible={unitModalVisible}
        onCancel={() => setUnitModalVisible(false)}
        footer={null}
      >
        <Form
          form={unitForm}
          layout="vertical"
          onFinish={handleUnitSubmit}
        >
          <Form.Item
            name="name"
            label="单位名称"
            rules={[{ required: true, message: '请输入单位名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="单位类型"
            rules={[{ required: true, message: '请选择单位类型' }]}
          >
            <Select>
              <Option value="police">警局</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="parent_id"
            label="上级单位"
          >
            <TreeSelect
              treeData={units.map(unit => ({
                title: unit.name,
                value: unit.id,
                key: unit.id,
              }))}
              placeholder="请选择上级单位"
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">正常</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 派警记录表单模态框 */}
      <Modal
        title={currentDispatch ? '编辑派警记录' : '新建派警记录'}
        visible={dispatchModalVisible}
        onCancel={() => setDispatchModalVisible(false)}
        footer={null}
      >
        <Form
          form={dispatchForm}
          layout="vertical"
          onFinish={handleDispatchSubmit}
        >
          <Form.Item
            name="alarm_id"
            label="警情编号"
            rules={[{ required: true, message: '请输入警情编号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="unit_id"
            label="派警单位"
            rules={[{ required: true, message: '请选择派警单位' }]}
          >
            <Select>
              {units.map(unit => (
                <Option key={unit.id} value={unit.id}>{unit.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="派警说明"
            rules={[{ required: true, message: '请输入派警说明' }]}
          >
            <TextArea rows={4} />
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

export default DispatchManagement; 