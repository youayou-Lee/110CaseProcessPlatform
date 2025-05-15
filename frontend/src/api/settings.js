import request from './request';

export const settingsApi = {
  // 获取系统设置
  getSettings: () => {
    return request.get('/settings');
  },

  // 更新系统设置
  updateSettings: (data) => {
    return request.put('/settings', data);
  },

  // 获取系统参数
  getParameters: () => {
    return request.get('/settings/parameters');
  },

  // 更新系统参数
  updateParameter: (key, value) => {
    return request.put(`/settings/parameters/${key}`, { value });
  }
}; 