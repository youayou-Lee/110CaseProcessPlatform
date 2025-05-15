# 错误处理规范

## 错误类型

### 业务错误
```javascript
// 错误码定义
const ErrorCodes = {
  // 通用错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  PARAM_ERROR: 'PARAM_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  
  // 业务错误
  ALARM_NOT_FOUND: 'ALARM_NOT_FOUND',
  ALARM_STATUS_ERROR: 'ALARM_STATUS_ERROR',
  DISPATCH_UNIT_NOT_FOUND: 'DISPATCH_UNIT_NOT_FOUND',
  DISPATCH_STATUS_ERROR: 'DISPATCH_STATUS_ERROR',
  HANDLING_TASK_NOT_FOUND: 'HANDLING_TASK_NOT_FOUND',
  HANDLING_STATUS_ERROR: 'HANDLING_STATUS_ERROR',
  ARCHIVING_NOT_FOUND: 'ARCHIVING_NOT_FOUND',
  ARCHIVING_STATUS_ERROR: 'ARCHIVING_STATUS_ERROR',
  
  // 系统错误
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  FILE_DOWNLOAD_ERROR: 'FILE_DOWNLOAD_ERROR'
};

// 错误信息定义
const ErrorMessages = {
  [ErrorCodes.UNKNOWN_ERROR]: '未知错误',
  [ErrorCodes.PARAM_ERROR]: '参数错误',
  [ErrorCodes.UNAUTHORIZED]: '未授权',
  [ErrorCodes.FORBIDDEN]: '禁止访问',
  [ErrorCodes.NOT_FOUND]: '资源不存在',
  
  [ErrorCodes.ALARM_NOT_FOUND]: '警情记录不存在',
  [ErrorCodes.ALARM_STATUS_ERROR]: '警情状态错误',
  [ErrorCodes.DISPATCH_UNIT_NOT_FOUND]: '调度单位不存在',
  [ErrorCodes.DISPATCH_STATUS_ERROR]: '调度状态错误',
  [ErrorCodes.HANDLING_TASK_NOT_FOUND]: '处置任务不存在',
  [ErrorCodes.HANDLING_STATUS_ERROR]: '处置状态错误',
  [ErrorCodes.ARCHIVING_NOT_FOUND]: '归档记录不存在',
  [ErrorCodes.ARCHIVING_STATUS_ERROR]: '归档状态错误',
  
  [ErrorCodes.DATABASE_ERROR]: '数据库错误',
  [ErrorCodes.NETWORK_ERROR]: '网络错误',
  [ErrorCodes.FILE_UPLOAD_ERROR]: '文件上传失败',
  [ErrorCodes.FILE_DOWNLOAD_ERROR]: '文件下载失败'
};
```

## 错误处理工具

### 错误类
```javascript
// utils/errors.js
export class AppError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export class BusinessError extends AppError {
  constructor(code, message, details = null) {
    super(code, message, details);
    this.name = 'BusinessError';
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(ErrorCodes.PARAM_ERROR, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message, details = null) {
    super(ErrorCodes.UNAUTHORIZED, message, details);
    this.name = 'AuthError';
  }
}
```

### 错误处理工具
```javascript
// utils/errorHandler.js
import { message } from 'antd';
import { ErrorCodes, ErrorMessages } from './constants';

export const handleError = (error) => {
  if (error instanceof AppError) {
    // 处理应用错误
    message.error(error.message);
    return;
  }
  
  if (error.response) {
    // 处理 HTTP 错误
    const { status, data } = error.response;
    switch (status) {
      case 400:
        message.error(data.message || ErrorMessages[ErrorCodes.PARAM_ERROR]);
        break;
      case 401:
        message.error(ErrorMessages[ErrorCodes.UNAUTHORIZED]);
        // 跳转到登录页
        window.location.href = '/login';
        break;
      case 403:
        message.error(ErrorMessages[ErrorCodes.FORBIDDEN]);
        break;
      case 404:
        message.error(ErrorMessages[ErrorCodes.NOT_FOUND]);
        break;
      case 500:
        message.error(ErrorMessages[ErrorCodes.DATABASE_ERROR]);
        break;
      default:
        message.error(ErrorMessages[ErrorCodes.UNKNOWN_ERROR]);
    }
    return;
  }
  
  if (error.request) {
    // 处理网络错误
    message.error(ErrorMessages[ErrorCodes.NETWORK_ERROR]);
    return;
  }
  
  // 处理其他错误
  message.error(ErrorMessages[ErrorCodes.UNKNOWN_ERROR]);
};
```

## 错误处理实现

### API 请求错误处理
```javascript
// api/request.js
import axios from 'axios';
import { handleError } from '../utils/errorHandler';

const request = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000
});

request.interceptors.response.use(
  response => response.data,
  error => {
    handleError(error);
    return Promise.reject(error);
  }
);

export default request;
```

### 表单验证错误处理
```javascript
// components/Form.js
import { Form } from 'antd';
import { ValidationError } from '../utils/errors';

const MyForm = () => {
  const [form] = Form.useForm();
  
  const handleSubmit = async (values) => {
    try {
      // 表单验证
      await form.validateFields();
      
      // 提交数据
      await submitData(values);
      
      message.success('提交成功');
    } catch (error) {
      if (error instanceof ValidationError) {
        // 处理验证错误
        const { details } = error;
        Object.keys(details).forEach(field => {
          form.setFields([{
            name: field,
            errors: [details[field]]
          }]);
        });
      } else {
        // 处理其他错误
        handleError(error);
      }
    }
  };
  
  return (
    <Form form={form} onFinish={handleSubmit}>
      {/* 表单内容 */}
    </Form>
  );
};
```

### 异步操作错误处理
```javascript
// hooks/useAsync.js
import { useState, useCallback } from 'react';
import { handleError } from '../utils/errorHandler';

export const useAsync = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (error) {
      setError(error);
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);
  
  return {
    loading,
    error,
    data,
    execute
  };
};
```

## 错误边界

### 错误边界组件
```javascript
// components/ErrorBoundary.js
import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // 记录错误日志
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }
  
  handleReload = () => {
    window.location.reload();
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面出错了"
          subTitle={this.state.error?.message || '未知错误'}
          extra={[
            <Button type="primary" key="reload" onClick={this.handleReload}>
              刷新页面
            </Button>
          ]}
        />
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 使用错误边界
```jsx
// App.js
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      {/* 应用内容 */}
    </ErrorBoundary>
  );
};
```

## 最佳实践

### 错误处理原则
- 统一错误处理
- 友好错误提示
- 错误日志记录
- 错误恢复机制

### 错误提示
- 使用友好的错误消息
- 提供错误解决建议
- 支持错误详情查看
- 支持错误反馈

### 错误日志
- 记录错误信息
- 记录错误上下文
- 记录错误堆栈
- 支持错误分析

### 错误恢复
- 提供重试机制
- 支持自动恢复
- 保存错误状态
- 支持手动恢复

### 性能优化
- 避免重复错误处理
- 优化错误提示性能
- 控制错误日志大小
- 优化错误恢复流程 