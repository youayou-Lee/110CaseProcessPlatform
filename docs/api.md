# API 接口文档

## 基础信息

- 基础URL: `http://localhost:3000/api`
- 所有请求都需要在 header 中携带 `Authorization: Bearer <token>`
- 响应格式统一为 JSON

## 认证接口

### 登录
- 请求方法：`POST`
- 路径：`/auth/login`
- 请求体：
```json
{
  "username": "string",
  "password": "string"
}
```
- 响应：
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "department": "string",
    "roles": ["string"]
  }
}
```

### 登出
- 请求方法：`POST`
- 路径：`/auth/logout`
- 响应：
```json
{
  "message": "登出成功"
}
```

## 警情管理接口

### 获取警情记录列表
- 请求方法：`GET`
- 路径：`/alarm/records`
- 查询参数：
  - `page`: 页码（默认1）
  - `pageSize`: 每页条数（默认10）
  - `status`: 状态筛选
  - `type`: 类型筛选
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- 响应：
```json
{
  "total": "number",
  "items": [{
    "id": "string",
    "type": "string",
    "status": "string",
    "location": "string",
    "description": "string",
    "reporter": "string",
    "reporterPhone": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }]
}
```

### 获取警情详情
- 请求方法：`GET`
- 路径：`/alarm/records/:id`
- 响应：
```json
{
  "id": "string",
  "type": "string",
  "status": "string",
  "location": "string",
  "description": "string",
  "reporter": "string",
  "reporterPhone": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "dispatchRecords": [{
    "id": "string",
    "unitId": "string",
    "unitName": "string",
    "status": "string",
    "createdAt": "string"
  }],
  "handlingRecords": [{
    "id": "string",
    "officerId": "string",
    "officerName": "string",
    "status": "string",
    "createdAt": "string"
  }]
}
```

### 创建警情记录
- 请求方法：`POST`
- 路径：`/alarm/records`
- 请求体：
```json
{
  "type": "string",
  "location": "string",
  "description": "string",
  "reporter": "string",
  "reporterPhone": "string"
}
```
- 响应：
```json
{
  "id": "string",
  "message": "创建成功"
}
```

### 更新警情状态
- 请求方法：`PUT`
- 路径：`/alarm/records/:id/status`
- 请求体：
```json
{
  "status": "string"
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

## 调度管理接口

### 获取调度单位列表
- 请求方法：`GET`
- 路径：`/dispatch/units`
- 响应：
```json
{
  "items": [{
    "id": "string",
    "name": "string",
    "type": "string",
    "status": "string",
    "contact": "string",
    "phone": "string",
    "address": "string"
  }]
}
```

### 创建调度单位
- 请求方法：`POST`
- 路径：`/dispatch/units`
- 请求体：
```json
{
  "name": "string",
  "type": "string",
  "contact": "string",
  "phone": "string",
  "address": "string"
}
```
- 响应：
```json
{
  "id": "string",
  "message": "创建成功"
}
```

### 获取调度记录列表
- 请求方法：`GET`
- 路径：`/dispatch/records`
- 查询参数：
  - `page`: 页码
  - `pageSize`: 每页条数
  - `status`: 状态筛选
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- 响应：
```json
{
  "total": "number",
  "items": [{
    "id": "string",
    "alarmId": "string",
    "unitId": "string",
    "unitName": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }]
}
```

### 创建调度记录
- 请求方法：`POST`
- 路径：`/dispatch/records`
- 请求体：
```json
{
  "alarmId": "string",
  "unitId": "string"
}
```
- 响应：
```json
{
  "id": "string",
  "message": "创建成功"
}
```

### 更新调度状态
- 请求方法：`PUT`
- 路径：`/dispatch/records/:id/status`
- 请求体：
```json
{
  "status": "string"
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

## 处置管理接口

### 获取处置人员列表
- 请求方法：`GET`
- 路径：`/handling/officers`
- 响应：
```json
{
  "items": [{
    "id": "string",
    "name": "string",
    "department": "string",
    "position": "string",
    "phone": "string",
    "status": "string"
  }]
}
```

### 获取处置任务列表
- 请求方法：`GET`
- 路径：`/handling/tasks`
- 查询参数：
  - `page`: 页码
  - `pageSize`: 每页条数
  - `status`: 状态筛选
  - `officerId`: 处置人员ID
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- 响应：
```json
{
  "total": "number",
  "items": [{
    "id": "string",
    "alarmId": "string",
    "officerId": "string",
    "officerName": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }]
}
```

### 创建处置任务
- 请求方法：`POST`
- 路径：`/handling/tasks`
- 请求体：
```json
{
  "alarmId": "string",
  "officerId": "string"
}
```
- 响应：
```json
{
  "id": "string",
  "message": "创建成功"
}
```

### 更新处置状态
- 请求方法：`PUT`
- 路径：`/handling/tasks/:id/status`
- 请求体：
```json
{
  "status": "string"
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

## 归档管理接口

### 获取归档记录列表
- 请求方法：`GET`
- 路径：`/archiving/records`
- 查询参数：
  - `page`: 页码
  - `pageSize`: 每页条数
  - `status`: 状态筛选
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- 响应：
```json
{
  "total": "number",
  "items": [{
    "id": "string",
    "alarmId": "string",
    "type": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }]
}
```

### 创建归档记录
- 请求方法：`POST`
- 路径：`/archiving/records`
- 请求体：
```json
{
  "alarmId": "string",
  "type": "string"
}
```
- 响应：
```json
{
  "id": "string",
  "message": "创建成功"
}
```

### 更新归档状态
- 请求方法：`PUT`
- 路径：`/archiving/records/:id/status`
- 请求体：
```json
{
  "status": "string"
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

### 上传归档文件
- 请求方法：`POST`
- 路径：`/archiving/records/:id/files`
- 请求体：`multipart/form-data`
  - `file`: 文件
  - `type`: 文件类型
  - `description`: 文件描述
- 响应：
```json
{
  "id": "string",
  "message": "上传成功"
}
```

## 统计分析接口

### 获取统计数据
- 请求方法：`GET`
- 路径：`/statistics`
- 查询参数：
  - `type`: 统计类型（daily/weekly/monthly）
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- 响应：
```json
{
  "alarmCount": "number",
  "dispatchCount": "number",
  "handlingCount": "number",
  "archivingCount": "number",
  "averageHandlingTime": "number",
  "trends": [{
    "date": "string",
    "alarmCount": "number",
    "dispatchCount": "number",
    "handlingCount": "number",
    "archivingCount": "number"
  }]
}
```

## 用户管理接口

### 获取用户列表
- 请求方法：`GET`
- 路径：`/users`
- 查询参数：
  - `page`: 页码
  - `pageSize`: 每页条数
  - `department`: 部门筛选
  - `role`: 角色筛选
- 响应：
```json
{
  "total": "number",
  "items": [{
    "id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "department": "string",
    "roles": ["string"],
    "status": "string"
  }]
}
```

### 创建用户
- 请求方法：`POST`
- 路径：`/users`
- 请求体：
```json
{
  "username": "string",
  "password": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "department": "string",
  "roles": ["string"]
}
```
- 响应：
```json
{
  "id": "string",
  "message": "创建成功"
}
```

### 更新用户
- 请求方法：`PUT`
- 路径：`/users/:id`
- 请求体：
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "department": "string",
  "roles": ["string"]
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

### 更新用户状态
- 请求方法：`PUT`
- 路径：`/users/:id/status`
- 请求体：
```json
{
  "status": "string"
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

### 重置密码
- 请求方法：`POST`
- 路径：`/users/:id/reset-password`
- 响应：
```json
{
  "message": "密码重置成功"
}
```

## 角色管理接口

### 获取角色列表
- 请求方法：`GET`
- 路径：`/roles`
- 响应：
```json
{
  "items": [{
    "id": "string",
    "name": "string",
    "description": "string",
    "permissions": ["string"]
  }]
}
```

### 创建角色
- 请求方法：`POST`
- 路径：`/roles`
- 请求体：
```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}
```
- 响应：
```json
{
  "id": "string",
  "message": "创建成功"
}
```

### 更新角色
- 请求方法：`PUT`
- 路径：`/roles/:id`
- 请求体：
```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

## 部门管理接口

### 获取部门列表
- 请求方法：`GET`
- 路径：`/departments`
- 响应：
```json
{
  "items": [{
    "id": "string",
    "name": "string",
    "parentId": "string",
    "description": "string"
  }]
}
```

### 创建部门
- 请求方法：`POST`
- 路径：`/departments`
- 请求体：
```json
{
  "name": "string",
  "parentId": "string",
  "description": "string"
}
```
- 响应：
```json
{
  "id": "string",
  "message": "创建成功"
}
```

### 更新部门
- 请求方法：`PUT`
- 路径：`/departments/:id`
- 请求体：
```json
{
  "name": "string",
  "parentId": "string",
  "description": "string"
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

## 日志管理接口

### 获取操作日志列表
- 请求方法：`GET`
- 路径：`/logs/operations`
- 查询参数：
  - `page`: 页码
  - `pageSize`: 每页条数
  - `type`: 操作类型
  - `userId`: 用户ID
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- 响应：
```json
{
  "total": "number",
  "items": [{
    "id": "string",
    "type": "string",
    "userId": "string",
    "userName": "string",
    "content": "string",
    "createdAt": "string"
  }]
}
```

### 获取登录日志列表
- 请求方法：`GET`
- 路径：`/logs/logins`
- 查询参数：
  - `page`: 页码
  - `pageSize`: 每页条数
  - `userId`: 用户ID
  - `startTime`: 开始时间
  - `endTime`: 结束时间
- 响应：
```json
{
  "total": "number",
  "items": [{
    "id": "string",
    "userId": "string",
    "userName": "string",
    "ip": "string",
    "status": "string",
    "createdAt": "string"
  }]
}
```

## 系统设置接口

### 获取系统设置
- 请求方法：`GET`
- 路径：`/settings`
- 响应：
```json
{
  "basic": {
    "systemName": "string",
    "version": "string",
    "contactEmail": "string",
    "contactPhone": "string"
  },
  "notification": {
    "emailEnabled": "boolean",
    "smsEnabled": "boolean",
    "interval": "number",
    "recipients": ["string"]
  },
  "security": {
    "passwordMinLength": "number",
    "passwordRequireNumber": "boolean",
    "passwordRequireSpecialChar": "boolean",
    "sessionTimeout": "number"
  },
  "backup": {
    "autoBackup": "boolean",
    "backupInterval": "number",
    "retentionDays": "number",
    "backupPath": "string"
  }
}
```

### 更新系统设置
- 请求方法：`PUT`
- 路径：`/settings`
- 请求体：
```json
{
  "basic": {
    "systemName": "string",
    "version": "string",
    "contactEmail": "string",
    "contactPhone": "string"
  },
  "notification": {
    "emailEnabled": "boolean",
    "smsEnabled": "boolean",
    "interval": "number",
    "recipients": ["string"]
  },
  "security": {
    "passwordMinLength": "number",
    "passwordRequireNumber": "boolean",
    "passwordRequireSpecialChar": "boolean",
    "sessionTimeout": "number"
  },
  "backup": {
    "autoBackup": "boolean",
    "backupInterval": "number",
    "retentionDays": "number",
    "backupPath": "string"
  }
}
```
- 响应：
```json
{
  "message": "更新成功"
}
```

### 执行系统备份
- 请求方法：`POST`
- 路径：`/settings/backup`
- 响应：
```json
{
  "message": "备份成功",
  "backupPath": "string"
}
```