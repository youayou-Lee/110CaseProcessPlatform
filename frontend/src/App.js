// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import AlarmRecordList from './pages/Alarm/AlarmRecordList';
import AlarmDetail from './pages/Alarm/AlarmDetail';
import DispatchManagement from './pages/Dispatch/DispatchManagement';
import HandlingManagement from './pages/Handling/HandlingManagement';
import ArchivingManagement from './pages/Archiving/ArchivingManagement';
import StatisticsDashboard from './pages/Statistics/StatisticsDashboard';
import SystemSettings from './pages/Settings/SystemSettings';
import UserManagement from './pages/User/UserManagement';
import RoleManagement from './pages/Role/RoleManagement';
import DepartmentManagement from './pages/Department/DepartmentManagement';
import LogManagement from './pages/Log/LogManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="alarm/records" element={<AlarmRecordList />} />
        <Route path="alarm/records/:id" element={<AlarmDetail />} />
        <Route path="alarm/dispatch" element={<DispatchManagement />} />
        <Route path="alarm/handling" element={<HandlingManagement />} />
        <Route path="alarm/archiving" element={<ArchivingManagement />} />
        <Route path="statistics" element={<StatisticsDashboard />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="logs" element={<LogManagement />} />
      </Route>
    </Routes>
  );
}

export default App;