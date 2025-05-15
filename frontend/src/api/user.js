import request from './request';

export const userApi = {
  // 获取用户列表
  getUsers: (params) => {
    return request.get('/users', { params });
  },

  // 创建用户
  createUser: (data) => {
    return request.post('/users', data);
  },

  // 更新用户
  updateUser: (id, data) => {
    return request.put(`/users/${id}`, data);
  },

  // 删除用户
  deleteUser: (id) => {
    return request.delete(`/users/${id}`);
  },

  // 重置密码
  resetPassword: (id) => {
    return request.post(`/users/${id}/reset-password`);
  },

  // 修改密码
  changePassword: (id, data) => {
    return request.put(`/users/${id}/password`, data);
  }
}; 