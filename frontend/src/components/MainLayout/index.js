import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  AlertOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/alarm/records',
      icon: <AlertOutlined />,
      label: '警情管理'
    },
    {
      key: '/departments',
      icon: <TeamOutlined />,
      label: '部门管理'
    },
    {
      key: '/alarm/archiving',
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
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          接报警服务管理系统
        </div>
        <div>
          <UserOutlined style={{ marginRight: 8 }} />
          <span>管理员</span>
          <LogoutOutlined style={{ marginLeft: 16, cursor: 'pointer' }} />
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
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: '#fff'
          }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 