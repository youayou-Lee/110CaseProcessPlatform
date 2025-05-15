# 主题定制规范

## 目录结构

```
src/
├── styles/              # 样式文件
│   ├── themes/         # 主题配置
│   │   ├── default.less # 默认主题
│   │   ├── dark.less   # 暗色主题
│   │   └── custom.less # 自定义主题
│   ├── variables.less  # 变量定义
│   └── global.less     # 全局样式
├── components/         # 组件
└── utils/             # 工具函数
```

## 主题配置

### 变量定义
```less
// styles/variables.less
// 颜色系统
@primary-color: #1890ff;
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #f5222d;

// 文字颜色
@text-color: rgba(0, 0, 0, 0.85);
@text-color-secondary: rgba(0, 0, 0, 0.45);

// 背景颜色
@background-color-base: #f5f5f5;
@background-color-light: #fafafa;

// 边框颜色
@border-color-base: #d9d9d9;
@border-color-split: #f0f0f0;

// 字体
@font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
@font-size-base: 14px;
@font-size-lg: 16px;
@font-size-sm: 12px;

// 圆角
@border-radius-base: 4px;
@border-radius-sm: 2px;

// 间距
@spacing-unit: 8px;
@spacing-lg: 24px;
@spacing-md: 16px;
@spacing-sm: 8px;
@spacing-xs: 4px;

// 阴影
@box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);
```

### 默认主题
```less
// styles/themes/default.less
@import '../variables.less';

// 主题配置
@theme-name: 'default';

// 覆盖默认变量
@primary-color: #1890ff;
@link-color: #1890ff;
@success-color: #52c41a;
@warning-color: #faad14;
@error-color: #f5222d;
@font-size-base: 14px;
@heading-color: rgba(0, 0, 0, 0.85);
@text-color: rgba(0, 0, 0, 0.65);
@text-color-secondary: rgba(0, 0, 0, 0.45);
@disabled-color: rgba(0, 0, 0, 0.25);
@border-radius-base: 4px;
@border-color-base: #d9d9d9;
@box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);
```

### 暗色主题
```less
// styles/themes/dark.less
@import '../variables.less';

// 主题配置
@theme-name: 'dark';

// 覆盖默认变量
@primary-color: #177ddc;
@link-color: #177ddc;
@success-color: #49aa19;
@warning-color: #d89614;
@error-color: #d32029;
@font-size-base: 14px;
@heading-color: rgba(255, 255, 255, 0.85);
@text-color: rgba(255, 255, 255, 0.65);
@text-color-secondary: rgba(255, 255, 255, 0.45);
@disabled-color: rgba(255, 255, 255, 0.25);
@border-radius-base: 4px;
@border-color-base: #434343;
@box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.45);
```

## 主题切换

### 主题配置组件
```jsx
// components/ThemeConfig.js
import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { useTheme } from '../hooks/useTheme';

const ThemeConfig = ({ children }) => {
  const { currentTheme, isDarkMode } = useTheme();
  
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: currentTheme.primaryColor,
          borderRadius: currentTheme.borderRadius,
          // 其他主题配置
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeConfig;
```

### 主题切换 Hook
```javascript
// hooks/useTheme.js
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(currentTheme));
  }, [currentTheme]);
  
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const updateTheme = (newTheme) => {
    setCurrentTheme(newTheme);
  };
  
  return {
    currentTheme,
    isDarkMode,
    toggleTheme,
    updateTheme
  };
};
```

## 组件样式

### 基础组件样式
```less
// styles/components/button.less
@import '../variables.less';

.button {
  &-primary {
    background-color: @primary-color;
    color: #fff;
    border: none;
    border-radius: @border-radius-base;
    padding: @spacing-sm @spacing-md;
    font-size: @font-size-base;
    
    &:hover {
      background-color: lighten(@primary-color, 10%);
    }
    
    &:active {
      background-color: darken(@primary-color, 10%);
    }
  }
  
  &-default {
    background-color: #fff;
    color: @text-color;
    border: 1px solid @border-color-base;
    border-radius: @border-radius-base;
    padding: @spacing-sm @spacing-md;
    font-size: @font-size-base;
    
    &:hover {
      color: @primary-color;
      border-color: @primary-color;
    }
  }
}
```

### 业务组件样式
```less
// styles/components/alarm-card.less
@import '../variables.less';

.alarm-card {
  background-color: #fff;
  border-radius: @border-radius-base;
  box-shadow: @box-shadow-base;
  padding: @spacing-md;
  margin-bottom: @spacing-md;
  
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-sm;
    
    .title {
      font-size: @font-size-lg;
      color: @text-color;
      font-weight: 500;
    }
    
    .status {
      font-size: @font-size-base;
      color: @text-color-secondary;
    }
  }
  
  &-content {
    color: @text-color;
    font-size: @font-size-base;
    line-height: 1.5;
  }
}
```

## 最佳实践

### 主题设计原则
- 保持视觉一致性
- 确保可访问性
- 支持响应式设计
- 考虑性能影响

### 变量使用规范
- 使用语义化变量名
- 避免硬编码值
- 保持变量层级清晰
- 及时更新变量文档

### 样式组织
- 按功能模块组织
- 使用 BEM 命名规范
- 避免样式冲突
- 保持代码整洁

### 性能优化
- 减少样式嵌套
- 避免过度使用选择器
- 合理使用 CSS 变量
- 优化主题切换性能

### 开发工具
- 使用 Less 预处理器
- 配置主题编辑器
- 支持实时预览
- 提供主题导出功能

### 测试规范
- 测试主题切换
- 测试响应式布局
- 测试可访问性
- 测试性能影响

### 部署规范
- 压缩样式文件
- 配置 CDN 缓存
- 处理主题加载
- 优化首屏加载 