import request from './request';

export const logApi = {
  // 获取日志列表
  getLogs: (params) => {
    return request.get('/logs', { params });
  },

  // 获取日志详情
  getLogDetail: (id) => {
    return request.get(`/logs/${id}`);
  },

  // 导出日志
  exportLogs: (params) => {
    return request.get('/logs/export', { 
      params,
      responseType: 'blob'
    });
  }
}; 