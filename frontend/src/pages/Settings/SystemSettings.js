import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  message,
  Tabs,
  Space,
  Divider,
  Upload,
  Row,
  Col
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { settingsApi } from '../../api/settings';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [basicForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [backupForm] = Form.useForm();

  // 获取系统设置
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [basic, notification, security, backup] = await Promise.all([
        settingsApi.getBasicSettings(),
        settingsApi.getNotificationSettings(),
        settingsApi.getSecuritySettings(),
        settingsApi.getBackupSettings()
      ]);

      basicForm.setFieldsValue(basic);
      notificationForm.setFieldsValue(notification);
      securityForm.setFieldsValue(security);
      backupForm.setFieldsValue(backup);
    } catch (error) {
      message.error('获取系统设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 保存基本设置
  const handleBasicSave = async (values) => {
    try {
      await settingsApi.updateBasicSettings(values);
      message.success('保存基本设置成功');
    } catch (error) {
      message.error('保存基本设置失败');
    }
  };

  // 保存通知设置
  const handleNotificationSave = async (values) => {
    try {
      await settingsApi.updateNotificationSettings(values);
      message.success('保存通知设置成功');
    } catch (error) {
      message.error('保存通知设置失败');
    }
  };

  // 保存安全设置
  const handleSecuritySave = async (values) => {
    try {
      await settingsApi.updateSecuritySettings(values);
      message.success('保存安全设置成功');
    } catch (error) {
      message.error('保存安全设置失败');
    }
  };

  // 保存备份设置
  const handleBackupSave = async (values) => {
    try {
      await settingsApi.updateBackupSettings(values);
      message.success('保存备份设置成功');
    } catch (error) {
      message.error('保存备份设置失败');
    }
  };

  // 执行系统备份
  const handleBackup = async () => {
    try {
      await settingsApi.createBackup();
      message.success('系统备份成功');
    } catch (error) {
      message.error('系统备份失败');
    }
  };

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              基本设置
            </span>
          }
          key="1"
        >
          <Card>
            <Form
              form={basicForm}
              layout="vertical"
              onFinish={handleBasicSave}
              initialValues={{
                system_name: '警情处置平台',
                system_version: '1.0.0',
                contact_email: 'admin@example.com',
                contact_phone: '1234567890'
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="system_name"
                    label="系统名称"
                    rules={[{ required: true, message: '请输入系统名称' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="system_version"
                    label="系统版本"
                    rules={[{ required: true, message: '请输入系统版本' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="contact_email"
                    label="联系邮箱"
                    rules={[
                      { required: true, message: '请输入联系邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="contact_phone"
                    label="联系电话"
                    rules={[{ required: true, message: '请输入联系电话' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BellOutlined />
              通知设置
            </span>
          }
          key="2"
        >
          <Card>
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationSave}
              initialValues={{
                enable_email_notification: true,
                enable_sms_notification: false,
                notification_interval: 5,
                notification_recipients: ['admin@example.com']
              }}
            >
              <Form.Item
                name="enable_email_notification"
                label="启用邮件通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="enable_sms_notification"
                label="启用短信通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="notification_interval"
                label="通知间隔（分钟）"
                rules={[{ required: true, message: '请输入通知间隔' }]}
              >
                <InputNumber min={1} max={60} />
              </Form.Item>
              <Form.Item
                name="notification_recipients"
                label="通知接收人"
                rules={[{ required: true, message: '请选择通知接收人' }]}
              >
                <Select mode="tags" placeholder="请输入邮箱地址">
                  <Option value="admin@example.com">管理员</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SecurityScanOutlined />
              安全设置
            </span>
          }
          key="3"
        >
          <Card>
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handleSecuritySave}
              initialValues={{
                password_min_length: 8,
                password_expire_days: 90,
                login_attempts: 5,
                session_timeout: 30
              }}
            >
              <Form.Item
                name="password_min_length"
                label="密码最小长度"
                rules={[{ required: true, message: '请输入密码最小长度' }]}
              >
                <InputNumber min={6} max={20} />
              </Form.Item>
              <Form.Item
                name="password_expire_days"
                label="密码过期天数"
                rules={[{ required: true, message: '请输入密码过期天数' }]}
              >
                <InputNumber min={30} max={365} />
              </Form.Item>
              <Form.Item
                name="login_attempts"
                label="最大登录尝试次数"
                rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
              >
                <InputNumber min={3} max={10} />
              </Form.Item>
              <Form.Item
                name="session_timeout"
                label="会话超时时间（分钟）"
                rules={[{ required: true, message: '请输入会话超时时间' }]}
              >
                <InputNumber min={5} max={120} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <CloudUploadOutlined />
              备份设置
            </span>
          }
          key="4"
        >
          <Card>
            <Form
              form={backupForm}
              layout="vertical"
              onFinish={handleBackupSave}
              initialValues={{
                auto_backup: true,
                backup_interval: 24,
                backup_retention: 30,
                backup_path: '/backup'
              }}
            >
              <Form.Item
                name="auto_backup"
                label="启用自动备份"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="backup_interval"
                label="备份间隔（小时）"
                rules={[{ required: true, message: '请输入备份间隔' }]}
              >
                <InputNumber min={1} max={168} />
              </Form.Item>
              <Form.Item
                name="backup_retention"
                label="备份保留天数"
                rules={[{ required: true, message: '请输入备份保留天数' }]}
              >
                <InputNumber min={1} max={365} />
              </Form.Item>
              <Form.Item
                name="backup_path"
                label="备份路径"
                rules={[{ required: true, message: '请输入备份路径' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    保存设置
                  </Button>
                  <Button type="primary" onClick={handleBackup} icon={<CloudUploadOutlined />}>
                    立即备份
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemSettings; 