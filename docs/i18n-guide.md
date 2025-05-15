# 国际化规范

## 目录结构

```
src/
├── locales/              # 国际化资源文件
│   ├── zh_CN/           # 简体中文
│   │   ├── common.json  # 通用翻译
│   │   ├── alarm.json   # 警情相关翻译
│   │   ├── dispatch.json # 调度相关翻译
│   │   └── ...
│   ├── en_US/           # 英文
│   │   ├── common.json
│   │   ├── alarm.json
│   │   └── ...
│   └── index.js         # 国际化配置
├── components/          # 组件
└── utils/              # 工具函数
```

## 配置实现

### 国际化配置
```javascript
// locales/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './zh_CN';
import enUS from './en_US';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': zhCN,
      'en-US': enUS
    },
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'zh-CN', // 回退语言
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### 语言包示例
```json
// locales/zh_CN/common.json
{
  "common": {
    "submit": "提交",
    "cancel": "取消",
    "confirm": "确认",
    "delete": "删除",
    "edit": "编辑",
    "search": "搜索",
    "reset": "重置",
    "loading": "加载中...",
    "success": "操作成功",
    "error": "操作失败"
  }
}

// locales/zh_CN/alarm.json
{
  "alarm": {
    "title": "警情管理",
    "list": {
      "title": "警情列表",
      "type": "警情类型",
      "status": "状态",
      "location": "位置",
      "time": "时间"
    },
    "status": {
      "pending": "待处理",
      "processing": "处理中",
      "completed": "已完成",
      "cancelled": "已取消"
    }
  }
}
```

## 使用规范

### 基础用法
```jsx
// 使用 Hook
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('alarm.title')}</h1>
      <button>{t('common.submit')}</button>
    </div>
  );
};

// 使用 HOC
import { withTranslation } from 'react-i18next';

const MyComponent = ({ t }) => {
  return (
    <div>
      <h1>{t('alarm.title')}</h1>
      <button>{t('common.submit')}</button>
    </div>
  );
};

export default withTranslation()(MyComponent);
```

### 带参数的翻译
```jsx
// 使用变量
const { t } = useTranslation();
t('welcome', { name: 'John' });

// 使用复数
t('items', { count: 4 });

// 使用嵌套
t('alarm.status.processing');
```

### 日期时间本地化
```jsx
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/zh-cn';

const MyComponent = () => {
  const { i18n } = useTranslation();
  
  // 设置 moment 语言
  moment.locale(i18n.language);
  
  return (
    <div>
      {moment().format('LLL')}
    </div>
  );
};
```

### 数字本地化
```jsx
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../utils/format';

const MyComponent = () => {
  const { i18n } = useTranslation();
  
  return (
    <div>
      {formatNumber(1234.56, i18n.language)}
    </div>
  );
};
```

## 语言切换

### 语言切换组件
```jsx
// components/LanguageSwitch.js
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';

const LanguageSwitch = () => {
  const { i18n } = useTranslation();
  
  const handleChange = (value) => {
    i18n.changeLanguage(value);
  };
  
  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      options={[
        { value: 'zh-CN', label: '简体中文' },
        { value: 'en-US', label: 'English' }
      ]}
    />
  );
};

export default LanguageSwitch;
```

### 语言持久化
```javascript
// utils/i18n.js
import i18n from 'i18next';

// 从本地存储加载语言设置
const savedLanguage = localStorage.getItem('language');
if (savedLanguage) {
  i18n.changeLanguage(savedLanguage);
}

// 监听语言变化
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});
```

## 最佳实践

### 翻译管理
- 按模块组织翻译文件
- 使用嵌套结构避免命名冲突
- 保持翻译键名简洁明了
- 及时更新翻译文件

### 代码规范
- 使用常量管理翻译键名
- 避免硬编码文本
- 使用 TypeScript 类型检查
- 保持翻译键名一致性

### 性能优化
- 按需加载语言包
- 缓存翻译结果
- 避免频繁切换语言
- 优化翻译文件大小

### 开发工具
- 使用 i18n 编辑器
- 支持自动提取文本
- 支持翻译检查
- 支持翻译同步

### 测试规范
- 测试翻译完整性
- 测试语言切换
- 测试特殊字符
- 测试长文本显示

### 部署规范
- 配置 CDN 缓存
- 设置正确的字符编码
- 配置语言检测
- 处理回退语言 