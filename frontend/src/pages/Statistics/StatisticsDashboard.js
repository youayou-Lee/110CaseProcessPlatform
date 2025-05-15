import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Table,
  Space,
  Button,
  message,
  Tabs,
  Progress
} from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  AlertOutlined,
  TeamOutlined,
  FileOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { statisticsApi } from '../../api/statistics';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatisticsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [statisticsType, setStatisticsType] = useState('daily');
  const [alarmStats, setAlarmStats] = useState({});
  const [dispatchStats, setDispatchStats] = useState({});
  const [handlingStats, setHandlingStats] = useState({});
  const [archivingStats, setArchivingStats] = useState({});

  // 获取统计数据
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const params = {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        type: statisticsType
      };

      const [alarmData, dispatchData, handlingData, archivingData] = await Promise.all([
        statisticsApi.getAlarmStatistics(params),
        statisticsApi.getDispatchStatistics(params),
        statisticsApi.getHandlingStatistics(params),
        statisticsApi.getArchivingStatistics(params)
      ]);

      setAlarmStats(alarmData);
      setDispatchStats(dispatchData);
      setHandlingStats(handlingData);
      setArchivingStats(archivingData);
    } catch (error) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange, statisticsType]);

  // 警情统计表格列定义
  const alarmColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '警情总数',
      dataIndex: 'total_count',
      key: 'total_count',
    },
    {
      title: '已处理',
      dataIndex: 'handled_count',
      key: 'handled_count',
    },
    {
      title: '处理中',
      dataIndex: 'processing_count',
      key: 'processing_count',
    },
    {
      title: '待处理',
      dataIndex: 'pending_count',
      key: 'pending_count',
    },
    {
      title: '平均处理时间',
      dataIndex: 'avg_handling_time',
      key: 'avg_handling_time',
      render: (time) => `${time}分钟`,
    },
  ];

  // 处置统计表格列定义
  const dispatchColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '派单总数',
      dataIndex: 'total_count',
      key: 'total_count',
    },
    {
      title: '已接收',
      dataIndex: 'received_count',
      key: 'received_count',
    },
    {
      title: '已处理',
      dataIndex: 'handled_count',
      key: 'handled_count',
    },
    {
      title: '平均响应时间',
      dataIndex: 'avg_response_time',
      key: 'avg_response_time',
      render: (time) => `${time}分钟`,
    },
  ];

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            allowClear={false}
          />
          <Select
            value={statisticsType}
            onChange={setStatisticsType}
            style={{ width: 120 }}
          >
            <Option value="daily">日报</Option>
            <Option value="weekly">周报</Option>
            <Option value="monthly">月报</Option>
          </Select>
          <Button type="primary" onClick={fetchStatistics}>
            刷新
          </Button>
        </Space>

        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="警情总数"
                value={alarmStats.total_count || 0}
                prefix={<AlertOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="处置任务数"
                value={handlingStats.total_count || 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="归档数量"
                value={archivingStats.total_count || 0}
                prefix={<FileOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均处理时间"
                value={alarmStats.avg_handling_time || 0}
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
          <TabPane tab="警情统计" key="1">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="警情趋势">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={alarmStats.trend_data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total_count" name="警情总数" stroke="#8884d8" />
                      <Line type="monotone" dataKey="handled_count" name="已处理" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="警情状态分布">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={alarmStats.status_distribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {(alarmStats.status_distribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
            <Card title="警情统计详情" style={{ marginTop: 16 }}>
              <Table
                columns={alarmColumns}
                dataSource={alarmStats.details || []}
                rowKey="date"
                loading={loading}
              />
            </Card>
          </TabPane>

          <TabPane tab="处置统计" key="2">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="处置趋势">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={handlingStats.trend_data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total_count" name="处置任务数" stroke="#8884d8" />
                      <Line type="monotone" dataKey="completed_count" name="已完成" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="处置效率">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <div style={{ marginBottom: 8 }}>平均响应时间</div>
                      <Progress
                        percent={handlingStats.avg_response_time_percent || 0}
                        status="active"
                        strokeColor="#108ee9"
                      />
                    </div>
                    <div>
                      <div style={{ marginBottom: 8 }}>平均处理时间</div>
                      <Progress
                        percent={handlingStats.avg_handling_time_percent || 0}
                        status="active"
                        strokeColor="#52c41a"
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
            <Card title="处置统计详情" style={{ marginTop: 16 }}>
              <Table
                columns={dispatchColumns}
                dataSource={handlingStats.details || []}
                rowKey="date"
                loading={loading}
              />
            </Card>
          </TabPane>

          <TabPane tab="归档统计" key="3">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="归档趋势">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={archivingStats.trend_data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total_count" name="归档数量" stroke="#8884d8" />
                      <Line type="monotone" dataKey="file_count" name="文件数量" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="归档类型分布">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={archivingStats.type_distribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {(archivingStats.type_distribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default StatisticsDashboard; 