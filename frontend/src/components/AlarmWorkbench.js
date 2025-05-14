// frontend/src/components/AlarmWorkbench.js
import React, { useState } from 'react';
import { Card, Form, Input, Select, Upload, Button, Space, message, Row, Col, Tabs } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import AlarmDetail from './AlarmDetail';
import AlarmDispatch from './AlarmDispatch';

const { TextArea } = Input;
const { Option } = Select;

function AlarmWorkbench() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // 处理表单提交
  const handleSubmit = (values) => {
    console.log('提交的表单数据:', values);
    message.success('接警记录已保存');
    form.resetFields();
    setFileList([]);
  };

  // 处理文件上传
  const handleUpload = ({ file, fileList }) => {
    setFileList(fileList);
    if (file.status === 'done') {
      message.success(`${file.name} 上传成功`);
    } else if (file.status === 'error') {
      message.error(`${file.name} 上传失败`);
    }
  };

  return (
    <div className="page-content">
      <Tabs defaultActiveKey="input" style={{ marginBottom: 16 }}>
        <Tabs.TabPane tab="警情信息录入" key="input">
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Card bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="callNumber"
                    label="报警电话"
                    rules={[{ required: true, message: '请输入报警电话' }]}
                  >
                    <Input placeholder="请输入报警电话" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="callerName"
                    label="报警人姓名"
                    rules={[{ required: true, message: '请输入报警人姓名' }]}
                  >
                    <Input placeholder="请输入报警人姓名" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="location"
                label="事发地点"
                rules={[{ required: true, message: '请输入事发地点' }]}
              >
                <Input placeholder="请输入详细地址" />
              </Form.Item>

              <Form.Item
                name="alarmType"
                label="警情类型"
                rules={[{ required: true, message: '请选择警情类型' }]}
              >
                <Select placeholder="请选择警情类型">
                  <Option value="criminal">刑事警情</Option>
                  <Option value="security">治安警情</Option>
                  <Option value="traffic">交通警情</Option>
                  <Option value="fire">火警</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label="警情描述"
                rules={[{ required: true, message: '请输入警情描述' }]}
              >
                <TextArea rows={4} placeholder="请详细描述警情内容" />
              </Form.Item>

              <Form.Item
                name="attachments"
                label="上传附件"
              >
                <Upload
                  fileList={fileList}
                  onChange={handleUpload}
                  action="/api/upload"
                  multiple
                >
                  <Button icon={<UploadOutlined />}>上传文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    保存接警记录
                  </Button>
                  <Button onClick={() => {
                    form.resetFields();
                    setFileList([]);
                  }}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
            </Col>

            <Col span={8}>
              <Card title="最近接警记录" bordered={false}>
                {/* 这里将添加最近接警记录列表 */}
                <p>暂无最近接警记录</p>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab="警情详情" key="detail">
          <AlarmDetail alarmId="AJ202401010001" />
        </Tabs.TabPane>
        <Tabs.TabPane tab="警情下发" key="dispatch">
          <AlarmDispatch alarmId="AJ202401010001" />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default AlarmWorkbench;