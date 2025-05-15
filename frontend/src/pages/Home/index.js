import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, message } from 'antd';
import {
  AlertOutlined,
  TeamOutlined,
  FileOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
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
import { statisticsApi } from '../../api/statistics';
import dayjs from 'dayjs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [todayStats, setTodayStats] = useState({
    alarm_count: 0,
    pending_tasks: 0,
    pending_archives: 0,
    avg_handling_time: 0
  });
  const [recentAlarms, setRecentAlarms] = useState([]);
  const [alarmTrend, setAlarmTrend] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);

  // 获取今日统计数据
  const fetchTodayStats = async () => {
    try {
      const response = await statisticsApi.getTodayStatistics();
      if (response.code === 200) {
        setTodayStats(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('获取今日统计数据失败');
    }
  };

  // 获取最近警情
  const fetchRecentAlarms = async () => {
    try {
      const response = await statisticsApi.getRecentAlarms();
      if (response.code === 200) {
        setRecentAlarms(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('获取最近警情失败');
    }
  };

  // 获取警情趋势
  const fetchAlarmTrend = async () => {
    try {
      const response = await statisticsApi.getAlarmTrend();
      if (response.code === 200) {
        setAlarmTrend(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('获取警情趋势失败');
    }
  };

  // 获取状态分布
  const fetchStatusDistribution = async () => {
    try {
      const response = await statisticsApi.getStatusDistribution();
      if (response.code === 200) {
        setStatusDistribution(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('获取状态分布失败');
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTodayStats(),
      fetchRecentAlarms(),
      fetchAlarmTrend(),
      fetchStatusDistribution()
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  // 最近警情表格列定义
  const recentAlarmColumns = [
    {
      title: '警情编号',
      dataIndex: 'alarm_id',
      key: 'alarm_id',
    },
    {
      title: '报警时间',
      dataIndex: 'alarm_time',
      key: 'alarm_time',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '警情类型',
      dataIndex: 'alarm_type',
      key: 'alarm_type',
    },
    {
      title: '报警人',
      dataIndex: 'reporter',
      key: 'reporter',
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
          cancelled: { color: 'red', text: '已取消' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <span style={{ color }}>{text}</span>;
      }
    }
  ];

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日警情"
              value={todayStats.alarm_count}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理任务"
              value={todayStats.pending_tasks}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待归档案件"
              value={todayStats.pending_archives}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均处理时间"
              value={todayStats.avg_handling_time}
              suffix="分钟"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="警情趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alarmTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="警情数量" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="警情状态分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusDistribution.map((entry, index) => (
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

      <Card title="最近警情" style={{ marginTop: 16 }}>
        <Table
          columns={recentAlarmColumns}
          dataSource={recentAlarms}
          rowKey="alarm_id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Home; 