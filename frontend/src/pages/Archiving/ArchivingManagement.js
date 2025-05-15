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
  Statistic,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { archiveApi } from '../../api/alarm';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const ArchivingManagement = () => {
  const [records, setRecords] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [fileModalVisible, setFileModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [recordForm] = Form.useForm();
  const [fileForm] = Form.useForm();

  // 获取归档记录列表
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await archiveApi.getArchives();
      setRecords(response);
    } catch (error) {
      message.error('获取归档记录列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取归档文件列表
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await archiveApi.getArchives();
      setFiles(response);
    } catch (error) {
      message.error('获取归档文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchFiles();
  }, []);

  // 处理归档记录表单提交
  const handleRecordSubmit = async (values) => {
    try {
      if (currentRecord) {
        await archiveApi.updateArchiveStatus(currentRecord.id, values);
        message.success('更新归档记录成功');
      } else {
        await archiveApi.createArchive(values);
        message.success('创建归档记录成功');
      }
      setRecordModalVisible(false);
      recordForm.resetFields();
      fetchRecords();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 处理归档文件上传
  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('record_id', currentRecord.id);
      await archiveApi.uploadArchiveFile(currentRecord.id, formData);
      message.success('文件上传成功');
      fetchFiles();
      return false;
    } catch (error) {
      message.error('文件上传失败');
      return false;
    }
  };

  // 删除归档记录
  const handleDeleteRecord = async (id) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个归档记录吗？',
      onOk: async () => {
        try {
          await archiveApi.updateArchiveStatus(id, 'cancelled');
          message.success('删除成功');
          fetchRecords();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 删除归档文件
  const handleDeleteFile = async (id) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个归档文件吗？',
      onOk: async () => {
        try {
          await archiveApi.deleteArchiveFile(id);
          message.success('删除成功');
          fetchFiles();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 归档记录表格列定义
  const recordColumns = [
    {
      title: '归档编号',
      dataIndex: 'archive_number',
      key: 'archive_number',
    },
    {
      title: '警情编号',
      dataIndex: 'alarm_number',
      key: 'alarm_number',
    },
    {
      title: '归档类型',
      dataIndex: 'archive_type',
      key: 'archive_type',
      render: (type) => {
        const typeMap = {
          case: { color: 'blue', text: '案件' },
          incident: { color: 'green', text: '事件' },
          other: { color: 'orange', text: '其他' },
        };
        const { color, text } = typeMap[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '归档时间',
      dataIndex: 'archive_time',
      key: 'archive_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '待归档' },
          archived: { color: 'green', text: '已归档' },
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
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRecord(record);
              recordForm.setFieldsValue(record);
              setRecordModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<FileOutlined />}
            onClick={() => {
              setCurrentRecord(record);
              setFileModalVisible(true);
            }}
          >
            管理文件
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRecord(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 归档文件表格列定义
  const fileColumns = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      key: 'file_type',
      render: (type) => {
        const typeMap = {
          document: { color: 'blue', text: '文档' },
          image: { color: 'green', text: '图片' },
          video: { color: 'purple', text: '视频' },
          audio: { color: 'orange', text: '音频' },
        };
        const { color, text } = typeMap[type] || { color: 'default', text: type };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '上传时间',
      dataIndex: 'upload_time',
      key: 'upload_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size) => `${(size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(record.file_url)}
          >
            预览
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => window.open(record.file_url)}
          >
            下载
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteFile(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="归档记录" key="1">
          <Card
            title="归档记录列表"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentRecord(null);
                  recordForm.resetFields();
                  setRecordModalVisible(true);
                }}
              >
                新建归档
              </Button>
            }
          >
            <Table
              columns={recordColumns}
              dataSource={records}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </TabPane>

        <TabPane tab="归档文件" key="2">
          <Card title="归档文件列表">
            <Table
              columns={fileColumns}
              dataSource={files}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 归档记录表单模态框 */}
      <Modal
        title={currentRecord ? '编辑归档记录' : '新建归档记录'}
        visible={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        footer={null}
      >
        <Form
          form={recordForm}
          layout="vertical"
          onFinish={handleRecordSubmit}
        >
          <Form.Item
            name="alarm_id"
            label="警情编号"
            rules={[{ required: true, message: '请输入警情编号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="archive_type"
            label="归档类型"
            rules={[{ required: true, message: '请选择归档类型' }]}
          >
            <Select>
              <Option value="case">案件</Option>
              <Option value="incident">事件</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="归档说明"
            rules={[{ required: true, message: '请输入归档说明' }]}
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

      {/* 归档文件上传模态框 */}
      <Modal
        title="管理归档文件"
        visible={fileModalVisible}
        onCancel={() => setFileModalVisible(false)}
        footer={null}
      >
        <Upload
          name="file"
          action={null}
          beforeUpload={handleFileUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>上传文件</Button>
        </Upload>
        <Table
          columns={fileColumns}
          dataSource={files.filter(file => file.record_id === currentRecord?.id)}
          rowKey="id"
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};

export default ArchivingManagement; 