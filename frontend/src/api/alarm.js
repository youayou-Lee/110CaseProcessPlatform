import request from './request';

// 警情记录相关API
export const alarmApi = {
  // 获取警情记录列表
  getAlarmRecords: (params) => {
    return request.get('/alarm/records', { params });
  },

  // 获取单个警情记录
  getAlarmRecord: (id) => {
    return request.get(`/alarm/records/${id}`);
  },

  // 创建警情记录
  createAlarmRecord: (data) => {
    return request.post('/alarm/records', data);
  },

  // 更新警情记录
  updateAlarmRecord: (id, data) => {
    return request.put(`/alarm/records/${id}`, data);
  },

  // 上传媒体文件
  uploadMedia: (id, formData) => {
    return request.post(`/alarm/records/${id}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 转写语音文件
  transcribeAudio: (id) => {
    return request.post(`/alarm/records/${id}/transcribe`);
  }
};

// 派警相关API
export const dispatchApi = {
  // 获取派警单位列表
  getUnits: (params) => {
    return request.get('/dispatch/units', { params });
  },

  // 创建派警记录
  createDispatch: (data) => {
    return request.post('/dispatch', data);
  },

  // 更新派警状态
  updateDispatchStatus: (id, status) => {
    return request.put(`/dispatch/${id}/status`, { status });
  },

  // 添加派警反馈
  addDispatchFeedback: (id, feedback) => {
    return request.post(`/dispatch/${id}/feedback`, { feedback });
  }
};

// 处置相关API
export const handlingApi = {
  // 获取警员列表
  getOfficers: (params) => {
    return request.get('/dispatching/officers', { params });
  },

  // 创建处置任务
  createTask: (data) => {
    return request.post('/dispatching/tasks', data);
  },

  // 更新任务状态
  updateTaskStatus: (id, status) => {
    return request.put(`/dispatching/tasks/${id}/status`, { status });
  },

  // 创建任务组
  createGroup: (data) => {
    return request.post('/dispatching/groups', data);
  },

  // 管理组员
  manageGroupMembers: (id, members) => {
    return request.put(`/dispatching/groups/${id}/members`, { members });
  }
};

// 归档相关API
export const archiveApi = {
  // 创建归档记录
  createArchive: (data) => {
    return request.post('/archiving/archives', data);
  },

  // 更新归档状态
  updateArchiveStatus: (id, status) => {
    return request.put(`/archiving/archives/${id}/status`, { status });
  },

  // 上传归档文件
  uploadArchiveFile: (id, formData) => {
    return request.post(`/archiving/archives/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 获取归档记录列表
  getArchives: (params) => {
    return request.get('/archiving/archives', { params });
  }
};

// 统计分析相关API
export const statisticsApi = {
  // 获取每日统计数据
  getDailyStatistics: (date) => {
    return request.get('/statistics/daily', { params: { date } });
  },

  // 获取每周统计数据
  getWeeklyStatistics: (date) => {
    return request.get('/statistics/weekly', { params: { date } });
  },

  // 获取每月统计数据
  getMonthlyStatistics: (date) => {
    return request.get('/statistics/monthly', { params: { date } });
  },

  // 获取统计配置列表
  getStatisticsConfigs: () => {
    return request.get('/statistics/configs');
  },

  // 创建统计配置
  createStatisticsConfig: (data) => {
    return request.post('/statistics/configs', data);
  },

  // 更新统计配置
  updateStatisticsConfig: (id, data) => {
    return request.put(`/statistics/configs/${id}`, data);
  }
}; 