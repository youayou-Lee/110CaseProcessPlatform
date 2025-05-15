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
  Tag,
  message,
  Tabs,
  Upload,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  FileOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { handlingApi } from '../../api/alarm';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const HandlingManagement = () => {
  const [officers, setOfficers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [officerModalVisible, setOfficerModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [currentOfficer, setCurrentOfficer] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [officerForm] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [groupForm] = Form.useForm();

  // 获取警员列表
  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const response = await handlingApi.getOfficers();
      setOfficers(response);
    } catch (error) {
      message.error('获取警员列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取处置任务列表
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await handlingApi.getTasks();
      setTasks(response);
    } catch (error) {
      message.error('获取处置任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取任务组列表
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await handlingApi.getGroups();
      setGroups(response);
    } catch (error) {
      message.error('获取任务组列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
    fetchTasks();
    fetchGroups();
  }, []);

  // 处理警员表单提交
  const handleOfficerSubmit = async (values) => {
    try {
      if (currentOfficer) {
        await handlingApi.updateOfficer(currentOfficer.id, values);
        message.success('更新警员信息成功');
      } else {
        await handlingApi.createOfficer(values);
        message.success('创建警员成功');
      }
      setOfficerModalVisible(false);
      officerForm.resetFields();
      fetchOfficers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 处理处置任务表单提交
  const handleTaskSubmit = async (values) => {
    try {
      if (currentTask) {
        await handlingApi.updateTask(currentTask.id, values);
        message.success('更新处置任务成功');
      } else {
        await handlingApi.createTask(values);
        message.success('创建处置任务成功');
      }
      setTaskModalVisible(false);
      taskForm.resetFields();
      fetchTasks();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 处理任务组表单提交
  const handleGroupSubmit = async (values) => {
    try {
      if (currentGroup) {
        await handlingApi.updateGroup(currentGroup.id, values);
        message.success('更新任务组成功');
      } else {
        await handlingApi.createGroup(values);
        message.success('创建任务组成功');
      }
      setGroupModalVisible(false);
      groupForm.resetFields();
      fetchGroups();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 删除警员
  const handleDeleteOfficer = async (id) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个警员吗？',
      onOk: async () => {
        try {
          await handlingApi.deleteOfficer(id);
          message.success('删除成功');
          fetchOfficers();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 更新任务状态
  const handleUpdateTaskStatus = async (id, status) => {
    try {
      await handlingApi.updateTaskStatus(id, status);
      message.success('更新状态成功');
      fetchTasks();
    } catch (error) {
      message.error('更新状态失败');
    }
  };

  // 更新组员状态
  const handleUpdateGroupMemberStatus = async (groupId, memberId, status) => {
    try {
      await handlingApi.updateGroupMemberStatus(groupId, memberId, status);
      message.success('更新组员状态成功');
      fetchGroups();
    } catch (error) {
      message.error('更新组员状态失败');
    }
  };

  // 警员表格列定义
  const officerColumns = [
    {
      title: '警员编号',
      dataIndex: 'officer_number',
      key: 'officer_number',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '所属单位',
      dataIndex: 'unit_name',
      key: 'unit_name',
    },
    {
      title: '技能',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills) => (
        <Space>
          {skills?.map(skill => (
            <Tag key={skill} color="blue">{skill}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'on_duty' ? 'green' : 'red'}>
          {status === 'on_duty' ? '在岗' : '离岗'}
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
              setCurrentOfficer(record);
              officerForm.setFieldsValue(record);
              setOfficerModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteOfficer(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处置任务表格列定义
  const taskColumns = [
    {
      title: '任务编号',
      dataIndex: 'task_number',
      key: 'task_number',
    },
    {
      title: '警情编号',
      dataIndex: 'alarm_number',
      key: 'alarm_number',
    },
    {
      title: '负责人',
      dataIndex: 'officer_name',
      key: 'officer_name',
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
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
              setCurrentTask(record);
              taskForm.setFieldsValue(record);
              setTaskModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Select
            style={{ width: 100 }}
            value={record.status}
            onChange={(value) => handleUpdateTaskStatus(record.id, value)}
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

  // 任务组表格列定义
  const groupColumns = [
    {
      title: '组编号',
      dataIndex: 'group_number',
      key: 'group_number',
    },
    {
      title: '组名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '组长',
      dataIndex: 'leader_name',
      key: 'leader_name',
    },
    {
      title: '成员数',
      dataIndex: 'member_count',
      key: 'member_count',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          active: { color: 'green', text: '活动中' },
          completed: { color: 'blue', text: '已完成' },
          disbanded: { color: 'red', text: '已解散' },
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
              setCurrentGroup(record);
              groupForm.setFieldsValue(record);
              setGroupModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<TeamOutlined />}
            onClick={() => {
              setCurrentGroup(record);
              setGroupModalVisible(true);
            }}
          >
            管理组员
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="警员管理" key="1">
          <Card
            title="警员列表"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentOfficer(null);
                  officerForm.resetFields();
                  setOfficerModalVisible(true);
                }}
              >
                新建警员
              </Button>
            }
          >
            <Table
              columns={officerColumns}
              dataSource={officers}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </TabPane>

        <TabPane tab="处置任务" key="2">
          <Card
            title="处置任务列表"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentTask(null);
                  taskForm.resetFields();
                  setTaskModalVisible(true);
                }}
              >
                新建任务
              </Button>
            }
          >
            <Table
              columns={taskColumns}
              dataSource={tasks}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </TabPane>

        <TabPane tab="任务组" key="3">
          <Card
            title="任务组列表"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentGroup(null);
                  groupForm.resetFields();
                  setGroupModalVisible(true);
                }}
              >
                新建任务组
              </Button>
            }
          >
            <Table
              columns={groupColumns}
              dataSource={groups}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 警员表单模态框 */}
      <Modal
        title={currentOfficer ? '编辑警员' : '新建警员'}
        visible={officerModalVisible}
        onCancel={() => setOfficerModalVisible(false)}
        footer={null}
      >
        <Form
          form={officerForm}
          layout="vertical"
          onFinish={handleOfficerSubmit}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="unit_id"
            label="所属单位"
            rules={[{ required: true, message: '请选择所属单位' }]}
          >
            <Select>
              {officers.map(officer => (
                <Option key={officer.id} value={officer.id}>{officer.unit_name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="skills"
            label="技能"
            rules={[{ required: true, message: '请选择技能' }]}
          >
            <Select mode="multiple">
              <Option value="investigation">侦查</Option>
              <Option value="negotiation">谈判</Option>
              <Option value="first_aid">急救</Option>
              <Option value="technical">技术</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="on_duty">在岗</Option>
              <Option value="off_duty">离岗</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 处置任务表单模态框 */}
      <Modal
        title={currentTask ? '编辑处置任务' : '新建处置任务'}
        visible={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleTaskSubmit}
        >
          <Form.Item
            name="alarm_id"
            label="警情编号"
            rules={[{ required: true, message: '请输入警情编号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="officer_id"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select>
              {officers.map(officer => (
                <Option key={officer.id} value={officer.id}>{officer.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
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

      {/* 任务组表单模态框 */}
      <Modal
        title={currentGroup ? '编辑任务组' : '新建任务组'}
        visible={groupModalVisible}
        onCancel={() => setGroupModalVisible(false)}
        footer={null}
      >
        <Form
          form={groupForm}
          layout="vertical"
          onFinish={handleGroupSubmit}
        >
          <Form.Item
            name="name"
            label="组名称"
            rules={[{ required: true, message: '请输入组名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="leader_id"
            label="组长"
            rules={[{ required: true, message: '请选择组长' }]}
          >
            <Select>
              {officers.map(officer => (
                <Option key={officer.id} value={officer.id}>{officer.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="members"
            label="组员"
            rules={[{ required: true, message: '请选择组员' }]}
          >
            <Select mode="multiple">
              {officers.map(officer => (
                <Option key={officer.id} value={officer.id}>{officer.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="组描述"
            rules={[{ required: true, message: '请输入组描述' }]}
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

export default HandlingManagement; 