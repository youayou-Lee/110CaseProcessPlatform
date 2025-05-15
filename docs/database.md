# 数据库设计文档

## 1. 数据库概述

本系统使用MySQL作为主要的数据存储系统，采用关系型数据库设计范式，确保数据的完整性、一致性和可维护性。

## 2. 数据库表设计

### 2.1 警情信息表 (alarm_records)

存储警情的基本信息。

```sql
CREATE TABLE alarm_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alarm_number VARCHAR(20) UNIQUE NOT NULL COMMENT '警情编号',
    call_number VARCHAR(20) NOT NULL COMMENT '报警电话',
    caller_name VARCHAR(50) NOT NULL COMMENT '报警人姓名',
    location TEXT NOT NULL COMMENT '事发地点',
    alarm_type VARCHAR(20) NOT NULL COMMENT '警情类型',
    description TEXT NOT NULL COMMENT '警情描述',
    status VARCHAR(20) NOT NULL COMMENT '警情状态',
    created_at DATETIME NOT NULL COMMENT '创建时间',
    updated_at DATETIME NOT NULL COMMENT '更新时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    updated_by BIGINT NOT NULL COMMENT '更新人ID',
    INDEX idx_alarm_number (alarm_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='警情信息表';
```

### 2.2 附件信息表 (attachments)

存储警情相关的附件信息。

```sql
CREATE TABLE attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alarm_id BIGINT NOT NULL COMMENT '关联警情ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(255) NOT NULL COMMENT '文件路径',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型',
    file_size BIGINT NOT NULL COMMENT '文件大小',
    created_at DATETIME NOT NULL COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '上传人ID',
    FOREIGN KEY (alarm_id) REFERENCES alarm_records(id),
    INDEX idx_alarm_id (alarm_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件信息表';
```

### 2.3 警情下发记录表 (dispatch_records)

记录警情下发的流转过程。

```sql
CREATE TABLE dispatch_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    alarm_id BIGINT NOT NULL COMMENT '关联警情ID',
    dispatch_unit_id BIGINT NOT NULL COMMENT '下发单位ID',
    dispatch_time DATETIME NOT NULL COMMENT '下发时间',
    status VARCHAR(20) NOT NULL COMMENT '接收状态',
    remark TEXT COMMENT '下发说明',
    created_at DATETIME NOT NULL COMMENT '创建时间',
    created_by BIGINT NOT NULL COMMENT '下发人ID',
    updated_at DATETIME NOT NULL COMMENT '更新时间',
    updated_by BIGINT NOT NULL COMMENT '更新人ID',
    FOREIGN KEY (alarm_id) REFERENCES alarm_records(id),
    INDEX idx_alarm_id (alarm_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='警情下发记录表';
```

### 2.4 组织机构表 (organizations)

存储警务机构的组织架构信息。

```sql
CREATE TABLE organizations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT COMMENT '父级机构ID',
    org_name VARCHAR(100) NOT NULL COMMENT '机构名称',
    org_code VARCHAR(50) NOT NULL COMMENT '机构编码',
    org_type VARCHAR(20) NOT NULL COMMENT '机构类型',
    org_level INT NOT NULL COMMENT '机构层级',
    status VARCHAR(20) NOT NULL COMMENT '状态',
    created_at DATETIME NOT NULL COMMENT '创建时间',
    updated_at DATETIME NOT NULL COMMENT '更新时间',
    FOREIGN KEY (parent_id) REFERENCES organizations(id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_org_code (org_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织机构表';
```

### 2.5 用户表 (users)

存储系统用户信息。

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    org_id BIGINT NOT NULL COMMENT '所属机构ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    status VARCHAR(20) NOT NULL COMMENT '状态',
    last_login DATETIME COMMENT '最后登录时间',
    created_at DATETIME NOT NULL COMMENT '创建时间',
    updated_at DATETIME NOT NULL COMMENT '更新时间',
    FOREIGN KEY (org_id) REFERENCES organizations(id),
    INDEX idx_username (username),
    INDEX idx_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2.6 角色表 (roles)

定义系统角色及权限。

```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
    description TEXT COMMENT '角色描述',
    status VARCHAR(20) NOT NULL COMMENT '状态',
    created_at DATETIME NOT NULL COMMENT '创建时间',
    updated_at DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE INDEX idx_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';
```

### 2.7 操作日志表 (operation_logs)

记录系统重要操作日志。

```sql
CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '操作人ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_content TEXT NOT NULL COMMENT '操作内容',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    created_at DATETIME NOT NULL COMMENT '操作时间',
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_operation_type (operation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
```

## 3. 表关系说明

### 3.1 主要关系

1. 警情信息表(alarm_records) 与 附件信息表(attachments)
   - 一对多关系：一条警情可以有多个附件

2. 警情信息表(alarm_records) 与 警情下发记录表(dispatch_records)
   - 一对多关系：一条警情可以有多条下发记录

3. 组织机构表(organizations) 的自关联
   - 通过parent_id实现机构层级关系

4. 用户表(users) 与 组织机构表(organizations)
   - 多对一关系：多个用户属于同一个机构

### 3.2 索引设计

- 针对查询频繁的字段建立索引
- 对外键字段建立索引
- 考虑组合索引优化查询性能

## 4. 数据安全

### 4.1 安全措施

1. 密码加密存储
2. 敏感信息脱敏显示
3. 数据库访问权限控制
4. 定期数据备份

### 4.2 数据维护

1. 定期数据清理
2. 历史数据归档
3. 索引优化维护
4. 性能监控