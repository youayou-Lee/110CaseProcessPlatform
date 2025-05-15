import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  AlertOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/alarm',
      icon: <AlertOutlined />,
      label: '警情管理',
      children: [
        {
          key: '/alarm/records',
          label: '警情记录'
        },
        {
          key: '/alarm/dispatch',
          label: '派警管理'
        },
        {
          key: '/alarm/handling',
          label: '处置管理'
        }
      ]
    },
    {
      key: '/archive',
      icon: <FileTextOutlined />,
      label: '归档管理'
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '统计分析'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置'
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          警情处理平台
        </div>
        <div>
          {/* 这里可以添加用户信息、退出登录等按钮 */}
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{
            background: '#fff',
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 