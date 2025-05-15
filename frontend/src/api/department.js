import request from './request';

export const departmentApi = {
  // 获取部门列表
  getDepartments: (params) => {
    return request.get('/departments', { params });
  },

  // 创建部门
  createDepartment: (data) => {
    return request.post('/departments', data);
  },

  // 更新部门
  updateDepartment: (id, data) => {
    return request.put(`/departments/${id}`, data);
  },

  // 删除部门
  deleteDepartment: (id) => {
    return request.delete(`/departments/${id}`);
  }
}; 