# API 调用规范

## 目录结构

```
src/
├── api/                # API 接口
│   ├── request.js     # 请求配置
│   ├── auth.js        # 认证相关
│   ├── alarm.js       # 警情相关
│   ├── dispatch.js    # 调度相关
│   ├── handling.js    # 处置相关
│   ├── archiving.js   # 归档相关
│   ├── statistics.js  # 统计分析
│   ├── user.js        # 用户相关
│   ├── role.js        # 角色相关
│   ├── department.js  # 部门相关
│   ├── log.js         # 日志相关
│   └── settings.js    # 系统设置
└── utils/             # 工具函数
```

## 请求配置

### 基础配置
```javascript
// request.js
import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error('请求失败');
      }
    } else {
      message.error('网络错误');
    }
    return Promise.reject(error);
  }
);

export default request;
```

## API 模块规范

### 警情管理
```javascript
// alarm.js
import request from './request';

export const getAlarmList = (params) => {
  return request({
    url: '/alarm/records',
    method: 'get',
    params
  });
};

export const getAlarmDetail = (id) => {
  return request({
    url: `/alarm/records/${id}`,
    method: 'get'
  });
};

export const createAlarm = (data) => {
  return request({
    url: '/alarm/records',
    method: 'post',
    data
  });
};

export const updateAlarmStatus = (id, data) => {
  return request({
    url: `/alarm/records/${id}/status`,
    method: 'put',
    data
  });
};
```

### 调度管理
```javascript
// dispatch.js
import request from './request';

export const getDispatchUnits = () => {
  return request({
    url: '/dispatch/units',
    method: 'get'
  });
};

export const createDispatchUnit = (data) => {
  return request({
    url: '/dispatch/units',
    method: 'post',
    data
  });
};

export const getDispatchRecords = (params) => {
  return request({
    url: '/dispatch/records',
    method: 'get',
    params
  });
};

export const createDispatchRecord = (data) => {
  return request({
    url: '/dispatch/records',
    method: 'post',
    data
  });
};
```

## 数据格式规范

### 请求参数
```javascript
// 分页参数
{
  page: 1,
  pageSize: 10
}

// 时间范围
{
  startTime: '2024-01-01 00:00:00',
  endTime: '2024-01-31 23:59:59'
}

// 状态筛选
{
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
}
```

### 响应数据
```javascript
// 列表数据
{
  total: 100,
  items: [{
    id: 'string',
    // 其他字段
  }]
}

// 详情数据
{
  id: 'string',
  // 其他字段
}

// 操作结果
{
  message: '操作成功'
}
```

## 错误处理

### 错误类型
```javascript
// 业务错误
{
  code: 'BUSINESS_ERROR',
  message: '业务错误信息'
}

// 参数错误
{
  code: 'PARAM_ERROR',
  message: '参数错误信息',
  fields: {
    field1: '错误描述'
  }
}

// 系统错误
{
  code: 'SYSTEM_ERROR',
  message: '系统错误信息'
}
```

### 错误处理
```javascript
try {
  const response = await api.getData();
  // 处理成功响应
} catch (error) {
  if (error.response) {
    // 处理响应错误
    const { code, message } = error.response.data;
    switch (code) {
      case 'BUSINESS_ERROR':
        // 处理业务错误
        break;
      case 'PARAM_ERROR':
        // 处理参数错误
        break;
      default:
        // 处理其他错误
    }
  } else {
    // 处理网络错误
  }
}
```

## 缓存处理

### 本地缓存
```javascript
// 缓存工具
const cache = {
  set: (key, value, expire) => {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    };
    localStorage.setItem(key, JSON.stringify(data));
  },
  get: (key) => {
    const data = JSON.parse(localStorage.getItem(key));
    if (data) {
      if (data.expire && data.expire < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      return data.value;
    }
    return null;
  },
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

// 使用缓存
const getData = async () => {
  const cached = cache.get('key');
  if (cached) {
    return cached;
  }
  const response = await api.getData();
  cache.set('key', response, 3600000); // 缓存1小时
  return response;
};
```

## 并发控制

### 请求队列
```javascript
class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject
      });
      this.run();
    });
  }

  async run() {
    if (this.running >= this.maxConcurrent) {
      return;
    }
    const task = this.queue.shift();
    if (!task) {
      return;
    }
    this.running++;
    try {
      const result = await task.request();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.running--;
      this.run();
    }
  }
}

// 使用请求队列
const queue = new RequestQueue();
const results = await Promise.all(
  requests.map(request => queue.add(request))
);
```

## 最佳实践

### 请求封装
- 统一处理请求配置
- 统一处理错误响应
- 支持请求取消
- 支持请求重试

### 数据转换
- 请求前转换数据格式
- 响应后转换数据格式
- 处理日期时间格式
- 处理枚举值转换

### 性能优化
- 使用请求缓存
- 实现数据预加载
- 控制并发请求数
- 实现请求防抖和节流

### 安全处理
- 处理 token 过期
- 防止 XSS 攻击
- 防止 CSRF 攻击
- 敏感数据加密

### 调试支持
- 记录请求日志
- 支持请求模拟
- 支持响应延迟
- 支持错误注入 