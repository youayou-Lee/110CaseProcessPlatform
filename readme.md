# 警情处理平台

一个基于 React + Ant Design 的现代化警情处理平台，提供警情记录、调度管理、处置管理、归档管理等功能。

## 功能特点

- 🚨 警情管理：警情记录、详情查看、状态跟踪
- 📞 调度管理：调度单位管理、调度记录管理
- 👥 处置管理：处置人员管理、处置任务管理、任务组管理
- 📦 归档管理：归档记录管理、文件管理
- 📊 统计分析：数据可视化、报表导出
- 👤 用户管理：用户、角色、部门管理
- 📝 日志管理：操作日志、登录日志
- ⚙️ 系统设置：基础设置、通知设置、安全设置、备份设置

## 技术栈

- 前端：React 18 + Ant Design 5.x + React Router 6 + Axios + Moment.js + Recharts
- 后端：Python 3.11 + Flask + MySQL + SQLAlchemy
- 开发工具：VS Code + Git

## 环境要求

### 基础环境
- Node.js >= 16（前端）
- npm >= 8（前端）
- Conda（后端）
- Python 3.11（后端）
- MySQL >= 8.0
- Git

### 开发工具
- VS Code（推荐）
  - ESLint 插件
  - Prettier 插件
  - MySQL 插件
- Chrome 或 Firefox 最新版
  - React Developer Tools 插件

## 快速开始

### 1. 克隆项目
```bash
git clone [项目地址]
cd 110CaseProcessPlatform
```

### 2. 安装依赖

#### 前端依赖
```bash
cd frontend
npm install
```

#### 后端依赖
```bash
# 创建并激活 conda 环境
conda create -n you python=3.11
conda activate you

# 安装依赖
pip install -r requirements.txt
```

### 3. 数据库配置

1. 创建数据库
```sql
CREATE DATABASE alarm_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置数据库连接
```bash
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alarm_platform
DB_USER=root
DB_PASSWORD=your_password
```

### 4. 环境变量配置

#### 前端配置
```bash
# frontend/.env
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

#### 后端配置
```bash
# backend/.env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=alarm_platform
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### 5. 初始化数据库
```bash
cd backend
npm run db:init
```

### 6. 启动服务

#### 开发环境
```bash
# 启动后端服务
conda activate you
python run.py

# 新开一个终端，启动前端服务
cd frontend
npm start
```

#### 生产环境
```bash
# 构建前端
cd frontend
npm run build

# 启动后端
conda activate you
gunicorn -w 4 -b 0.0.0.0:3001 run:app
```

### 7. 访问应用
- 开发环境：http://localhost:3000
- 生产环境：http://localhost:3001

## 项目结构

```
项目根目录/
├── frontend/           # 前端项目
│   ├── src/           # 源代码
│   │   ├── api/       # API 接口
│   │   ├── components/# 公共组件
│   │   ├── pages/     # 页面组件
│   │   ├── utils/     # 工具函数
│   │   └── App.js     # 应用入口
│   ├── public/        # 静态资源
│   └── package.json   # 前端依赖配置
│
├── backend/           # 后端项目
│   ├── src/          # 源代码
│   │   ├── controllers/# 控制器
│   │   ├── models/   # 数据模型
│   │   ├── routes/   # 路由
│   │   ├── services/ # 业务逻辑
│   │   ├── utils/    # 工具函数
│   │   └── app.js    # 应用入口
│   ├── config/       # 配置文件
│   └── package.json  # 后端依赖配置
│
└── docs/             # 项目文档
```

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 React 最佳实践
- 使用 TypeScript 进行类型检查

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档修改
- style: 代码格式修改
- refactor: 代码重构
- test: 测试用例修改
- chore: 其他修改

### 分支管理
- master: 主分支
- develop: 开发分支
- feature/*: 功能分支
- hotfix/*: 修复分支

## 常见问题

### 1. 端口占用
如果遇到端口占用问题，可以修改配置文件中的端口号：
- 前端：修改 `frontend/package.json` 中的 `start` 脚本
- 后端：修改 `backend/.env` 中的 `PORT`

### 2. 数据库连接
- 确保 MySQL 服务已启动
- 检查数据库连接信息是否正确
- 确保数据库用户有足够权限

### 3. 依赖安装
如果安装依赖时遇到问题：
```bash
# 清除 npm 缓存
npm cache clean --force

# 使用 yarn 替代 npm
npm install -g yarn
yarn install
```

### 4. 跨域问题
- 检查 API 地址配置是否正确
- 确保后端 CORS 配置正确

## 部署指南

### 前端部署
```bash
# 构建生产环境代码
cd frontend
npm run build

# 部署到 Nginx
cp -r build/* /usr/share/nginx/html/
```

### 后端部署
```bash
# 构建生产环境代码
cd backend
npm run build

# 启动服务
npm start
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT License

