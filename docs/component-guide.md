# 组件开发规范

## 目录结构

```
src/
├── components/           # 公共组件
│   ├── common/          # 基础组件
│   ├── layout/          # 布局组件
│   └── business/        # 业务组件
├── pages/               # 页面组件
│   ├── Alarm/          # 警情相关页面
│   ├── Dispatch/       # 调度相关页面
│   ├── Handling/       # 处置相关页面
│   ├── Archiving/      # 归档相关页面
│   ├── Statistics/     # 统计分析页面
│   ├── Settings/       # 系统设置页面
│   ├── User/           # 用户管理页面
│   ├── Role/           # 角色管理页面
│   ├── Department/     # 部门管理页面
│   └── Log/            # 日志管理页面
└── utils/              # 工具函数
```

## 命名规范

### 文件命名
- 组件文件使用 PascalCase 命名
- 工具函数文件使用 camelCase 命名
- 样式文件与组件文件同名，使用 .module.css 后缀

### 组件命名
- 使用 PascalCase 命名组件
- 组件名应该是描述性的，表明其用途
- 避免使用单个单词作为组件名

### 变量命名
- 使用 camelCase 命名变量和函数
- 布尔类型变量使用 is、has、should 等前缀
- 常量使用大写字母和下划线

## 组件开发规范

### 函数组件
```jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ComponentName.module.css';

const ComponentName = ({ prop1, prop2 }) => {
  // 状态声明
  const [state, setState] = useState(initialState);

  // 副作用
  useEffect(() => {
    // 副作用逻辑
  }, [dependencies]);

  // 事件处理函数
  const handleEvent = () => {
    // 处理逻辑
  };

  return (
    <div className={styles.container}>
      {/* 组件内容 */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

### 类组件
```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './ComponentName.module.css';

class ComponentName extends Component {
  state = {
    // 初始状态
  };

  componentDidMount() {
    // 生命周期方法
  }

  handleEvent = () => {
    // 事件处理函数
  };

  render() {
    const { prop1, prop2 } = this.props;
    const { state1 } = this.state;

    return (
      <div className={styles.container}>
        {/* 组件内容 */}
      </div>
    );
  }
}

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

## 状态管理

### 本地状态
- 使用 useState 或 this.state 管理组件内部状态
- 状态应该是不可变的，使用展开运算符创建新对象

### 全局状态
- 使用 Context API 管理全局状态
- 将状态和操作封装在 Provider 组件中
- 使用 useReducer 处理复杂状态逻辑

## 样式规范

### CSS Modules
```css
/* ComponentName.module.css */
.container {
  /* 样式定义 */
}

.title {
  /* 样式定义 */
}
```

### 样式命名
- 使用 BEM 命名规范
- 类名应该是描述性的
- 避免使用过于具体的样式名

## 性能优化

### 避免不必要的渲染
- 使用 React.memo 包装函数组件
- 使用 useMemo 缓存计算结果
- 使用 useCallback 缓存回调函数

### 列表渲染
- 使用 key 属性优化列表渲染
- 考虑使用虚拟滚动处理大量数据
- 避免在渲染时进行复杂计算

## 错误处理

### 错误边界
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 错误日志记录
  }

  render() {
    if (this.state.hasError) {
      return <h1>出错了</h1>;
    }

    return this.props.children;
  }
}
```

### 异步错误处理
```jsx
const handleAsync = async () => {
  try {
    const result = await asyncOperation();
    // 处理结果
  } catch (error) {
    // 错误处理
  }
};
```

## 测试规范

### 单元测试
```jsx
import { render, screen } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### 集成测试
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from './ComponentName';

describe('ComponentName Integration', () => {
  it('handles user interaction correctly', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('clicked')).toBeInTheDocument();
  });
});
```

## 文档规范

### 组件文档
```jsx
/**
 * 组件描述
 * @component
 * @example
 * ```jsx
 * <ComponentName prop1="value" />
 * ```
 */
```

### Props 文档
```jsx
/**
 * @prop {string} prop1 - 属性1的描述
 * @prop {number} [prop2=0] - 属性2的描述
 */
```

## 最佳实践

### 代码组织
- 相关代码放在一起
- 使用有意义的变量名
- 保持函数简短，单一职责
- 使用注释说明复杂逻辑

### 可访问性
- 使用语义化标签
- 添加适当的 ARIA 属性
- 确保键盘可访问性
- 提供足够的颜色对比度

### 国际化
- 使用 i18n 库处理文本
- 避免硬编码文本
- 考虑不同语言的布局需求

### 响应式设计
- 使用相对单位
- 实现移动优先设计
- 测试不同屏幕尺寸
- 使用媒体查询适配布局 