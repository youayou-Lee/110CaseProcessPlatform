import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tree,
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Row,
  Col,
  Divider,
  TreeSelect
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { departmentApi } from '../../api/department';

const { TextArea } = Input;

const DepartmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [form] = Form.useForm();

  // 获取部门列表
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentApi.getDepartments();
      setDepartments(response);
      // 转换为树形数据
      const tree = convertToTreeData(response);
      setTreeData(tree);
    } catch (error) {
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 将扁平数据转换为树形数据
  const convertToTreeData = (data) => {
    const map = {};
    const result = [];

    // 创建映射
    data.forEach(item => {
      map[item.id] = {
        ...item,
        key: item.id,
        title: item.name,
        children: []
      };
    });

    // 构建树形结构
    data.forEach(item => {
      const node = map[item.id];
      if (item.parent_id) {
        const parent = map[item.parent_id];
        if (parent) {
          parent.children.push(node);
        }
      } else {
        result.push(node);
      }
    });

    return result;
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      if (currentDepartment) {
        await departmentApi.updateDepartment(currentDepartment.id, values);
        message.success('更新部门成功');
      } else {
        await departmentApi.createDepartment(values);
        message.success('创建部门成功');
      }
      setModalVisible(false);
      form.resetFields();
      fetchDepartments();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 删除部门
  const handleDelete = async (id) => {
    try {
      await departmentApi.deleteDepartment(id);
      message.success('删除部门成功');
      fetchDepartments();
    } catch (error) {
      message.error('删除部门失败');
    }
  };

  // 更新部门状态
  const handleStatusChange = async (id, status) => {
    try {
      await departmentApi.updateDepartmentStatus(id, status);
      message.success('更新部门状态成功');
      fetchDepartments();
    } catch (error) {
      message.error('更新部门状态失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部门编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '上级部门',
      dataIndex: 'parent',
      key: 'parent',
      render: (parent) => parent?.name || '-',
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentDepartment(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Button
              type="link"
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleStatusChange(record.id, record.status === 'active' ? 'inactive' : 'active')}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个部门吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="部门结构" extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentDepartment(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              新建部门
            </Button>
          }>
            <Tree
              treeData={treeData}
              defaultExpandAll
              onSelect={(selectedKeys, info) => {
                if (selectedKeys.length > 0) {
                  const department = departments.find(d => d.id === selectedKeys[0]);
                  if (department) {
                    setCurrentDepartment(department);
                    form.setFieldsValue(department);
                    setModalVisible(true);
                  }
                }
              }}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card title="部门列表">
            <Table
              columns={columns}
              dataSource={departments}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={currentDepartment ? '编辑部门' : '新建部门'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input prefix={<TeamOutlined />} />
          </Form.Item>
          <Form.Item
            name="code"
            label="部门编码"
            rules={[{ required: true, message: '请输入部门编码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="parent_id"
            label="上级部门"
          >
            <TreeSelect
              treeData={treeData}
              placeholder="请选择上级部门"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="manager"
                label="负责人"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement; 