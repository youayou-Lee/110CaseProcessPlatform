import request from './request';

export const statisticsApi = {
  // 获取今日统计数据
  getTodayStatistics: () => {
    return request.get('/statistics/today');
  },

  // 获取最近警情
  getRecentAlarms: () => {
    return request.get('/statistics/recent-alarms');
  },

  // 获取警情趋势
  getAlarmTrend: () => {
    return request.get('/statistics/alarm-trend');
  },

  // 获取状态分布
  getStatusDistribution: () => {
    return request.get('/statistics/status-distribution');
  },

  // 获取警情统计数据
  getAlarmStatistics: (params) => {
    return request.get('/statistics/alarm', { params });
  },

  // 获取派单统计数据
  getDispatchStatistics: (params) => {
    return request.get('/statistics/dispatch', { params });
  },

  // 获取处置统计数据
  getHandlingStatistics: (params) => {
    return request.get('/statistics/handling', { params });
  },

  // 获取归档统计数据
  getArchivingStatistics: (params) => {
    return request.get('/statistics/archiving', { params });
  }
}; 