import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Timeline,
  Upload,
  Button,
  Space,
  Modal,
  message,
  Tabs,
  Image
} from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined
} from '@ant-design/icons';
import { alarmApi } from '../../api/alarm';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

const AlarmDetail = () => {
  const { id } = useParams();
  const [alarmRecord, setAlarmRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [transcription, setTranscription] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 获取警情详情
  const fetchAlarmDetail = async () => {
    setLoading(true);
    try {
      const response = await alarmApi.getAlarmRecord(id);
      setAlarmRecord(response);
      setMediaFiles(response.media_files || []);
      setTranscription(response.transcription);
    } catch (error) {
      message.error('获取警情详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarmDetail();
  }, [id]);

  // 上传媒体文件
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await alarmApi.uploadMedia(id, formData);
      message.success('文件上传成功');
      fetchAlarmDetail();
    } catch (error) {
      message.error('文件上传失败');
    }
  };

  // 转写语音文件
  const handleTranscribe = async () => {
    try {
      await alarmApi.transcribeAudio(id);
      message.success('语音转写任务已提交');
      fetchAlarmDetail();
    } catch (error) {
      message.error('语音转写失败');
    }
  };

  // 预览图片
  const handlePreview = (file) => {
    setPreviewImage(file.url);
    setPreviewVisible(true);
  };

  // 渲染媒体文件列表
  const renderMediaFiles = () => {
    return (
      <Space wrap>
        {mediaFiles.map((file) => {
          const icon = file.file_type === 'image' ? <PictureOutlined /> :
                      file.file_type === 'video' ? <VideoCameraOutlined /> :
                      file.file_type === 'audio' ? <AudioOutlined /> :
                      <FileOutlined />;

          return (
            <Card
              key={file.id}
              size="small"
              style={{ width: 200 }}
              cover={
                file.file_type === 'image' ? (
                  <Image
                    alt={file.file_name}
                    src={file.file_path}
                    style={{ height: 120, objectFit: 'cover' }}
                    preview={false}
                    onClick={() => handlePreview(file)}
                  />
                ) : null
              }
            >
              <Card.Meta
                title={file.file_name}
                description={
                  <Space>
                    {icon}
                    <span>{file.file_type}</span>
                    <span>{dayjs(file.upload_time).format('YYYY-MM-DD HH:mm')}</span>
                  </Space>
                }
              />
            </Card>
          );
        })}
      </Space>
    );
  };

  if (!alarmRecord) {
    return null;
  }

  return (
    <div>
      <Card title="警情详情" loading={loading}>
        <Descriptions bordered>
          <Descriptions.Item label="警情编号" span={3}>
            {alarmRecord.alarm_number}
          </Descriptions.Item>
          <Descriptions.Item label="警情类型">
            <Tag color={alarmRecord.alarm_type === 'emergency' ? 'red' : 'blue'}>
              {alarmRecord.alarm_type === 'emergency' ? '紧急' : '普通'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="报警时间">
            {dayjs(alarmRecord.alarm_time).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={
              alarmRecord.status === 'pending' ? 'orange' :
              alarmRecord.status === 'processing' ? 'blue' :
              alarmRecord.status === 'completed' ? 'green' :
              'red'
            }>
              {
                alarmRecord.status === 'pending' ? '待处理' :
                alarmRecord.status === 'processing' ? '处理中' :
                alarmRecord.status === 'completed' ? '已完成' :
                '已取消'
              }
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="报警人" span={3}>
            {alarmRecord.caller_name}
          </Descriptions.Item>
          <Descriptions.Item label="联系电话" span={3}>
            {alarmRecord.caller_phone}
          </Descriptions.Item>
          <Descriptions.Item label="警情地址" span={3}>
            {alarmRecord.location}
          </Descriptions.Item>
          <Descriptions.Item label="警情描述" span={3}>
            {alarmRecord.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="处理记录" style={{ marginTop: 16 }}>
        <Timeline>
          {alarmRecord.handling_logs?.map((log) => (
            <Timeline.Item key={log.id}>
              <p>{dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss')}</p>
              <p>{log.action}: {log.details}</p>
              <p>操作人: {log.operator}</p>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      <Card title="相关文件" style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="媒体文件" key="1">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Upload
                  customRequest={({ file }) => handleUpload(file)}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>上传文件</Button>
                </Upload>
                <Button
                  icon={<AudioOutlined />}
                  onClick={handleTranscribe}
                  disabled={!mediaFiles.some(f => f.file_type === 'audio')}
                >
                  转写语音
                </Button>
              </Space>
              {renderMediaFiles()}
            </Space>
          </TabPane>
          <TabPane tab="语音转写" key="2">
            {transcription ? (
              <div>
                <p>转写时间：{dayjs(transcription.created_at).format('YYYY-MM-DD HH:mm:ss')}</p>
                <p>转写内容：{transcription.content}</p>
              </div>
            ) : (
              <p>暂无转写内容</p>
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="预览图片" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default AlarmDetail; 