# 产品需求文档 (PRD)
# 外卖菜单智能识别与整理系统

## 1. 项目概述

### 1.1 项目名称
美团饿了么菜单整理批量上架 - 高端菜谱识别工具

### 1.2 项目背景
外卖商家在上架菜品时，需要手动将纸质或图片菜单中的菜品信息逐一录入到平台系统中，工作繁琐且容易出错。本项目旨在通过 AI 视觉识别技术，自动提取菜单图片中的菜品名称和价格，并支持自定义溢价比例，帮助商家快速完成菜品数字化和定价工作。

### 1.3 核心价值
- **秒级识别**：AI 快速提取菜单中所有菜品信息
- **准确无误**：确保菜品名称和价格与原图完全一致
- **灵活溢价**：支持自定义溢价比例，一键生成外卖定价
- **批量处理**：支持多张图片同时上传分析

---

## 2. 功能需求

### 2.1 核心功能

#### 2.1.1 图片上传功能
| 需求项 | 描述 |
|-------|------|
| 上传方式 | 点击上传 / 拖拽上传 |
| 图片格式 | PNG, JPG, JPEG, WebP |
| 单张限制 | 最大 10MB |
| 批量上传 | 支持多张图片同时上传 |
| 预览功能 | 上传后显示缩略图预览 |
| 删除功能 | 支持删除已选图片 |

#### 2.1.2 AI 菜单识别功能
| 需求项 | 描述 |
|-------|------|
| 识别模型 | Gemini 3 Flash Preview |
| 识别内容 | 菜品名称、菜品价格 |
| 输出格式 | 结构化 JSON 数据 |
| 准确性要求 | 菜品名称与原图完全一致 |
| 价格处理 | 如遇价格区间，取最低价 |

#### 2.1.3 结果展示功能
| 需求项 | 描述 |
|-------|------|
| 展示形式 | 表格形式 |
| 第一列 | 菜品名称 |
| 第二列 | 基础价格（原价） |
| 第三列 | 溢价后价格 |
| 附加信息 | 溢价金额差值显示 |

#### 2.1.4 溢价设置功能
| 需求项 | 描述 |
|-------|------|
| 预设比例 | 0%, 10%, 20%, 30%, 35%, 50% |
| 自定义输入 | 支持手动输入任意百分比 |
| 实时更新 | 切换比例后表格即时更新 |
| 总价计算 | 显示所有菜品溢价后的总金额 |

### 2.2 辅助功能
- 导出数据功能（打印）
- 重新分析功能
- 加载状态提示
- 错误处理与提示

---

## 3. 技术规格

### 3.1 技术栈

| 类别 | 技术选型 |
|-----|---------|
| 框架 | Next.js 14+ (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 3.x |
| UI 组件 | shadcn/ui |
| 图标 | Lucide React |
| 配色系统 | Radix Colors |
| 表格库 | TanStack Table (React Table v8) |
| 响应式工具 | react-responsive |

### 3.2 API 配置

```yaml
API Provider: 云雾 AI
Model: gemini-3-flash-preview
Endpoint: https://yunwu.ai/v1beta/models/gemini-3-flash-preview:streamGenerateContent
Authentication: Bearer Token (via query param `key`)
API Key: sk-a2Cak3aSwdxbujgNQ1HWZjJKqhwMEHcnCJv3bj6CGmqXLoeP
Content-Type: application/json
```

### 3.3 API 请求格式

```typescript
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string; // base64
      };
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    responseMimeType?: string;
  };
}
```

### 3.4 数据结构

```typescript
// 菜品项
interface MenuItem {
  id: string;
  name: string;
  originalPrice: number;
}

// 表格展示数据（带溢价）
interface MenuTableItem extends MenuItem {
  markupPrice: number;
}

// 处理状态
enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// API 响应结构
interface ExtractionResult {
  items: MenuItem[];
}
```

---

## 4. 页面结构

### 4.1 页面布局

```
┌─────────────────────────────────────────────────────┐
│  Header (Logo + 导航)                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  主要内容区域                                        │
│  ├── 引导文案 (IDLE 状态)                           │
│  ├── 上传区域 (IDLE 状态)                           │
│  ├── 处理中状态 (ANALYZING 状态)                    │
│  ├── 错误提示 (ERROR 状态)                          │
│  └── 结果展示 (SUCCESS 状态)                        │
│      ├── 溢价设置卡片                               │
│      └── 数据表格                                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Footer (版权信息)                                   │
└─────────────────────────────────────────────────────┘
```

### 4.2 组件清单

| 组件名称 | 路径 | 功能描述 |
|---------|------|---------|
| Logo | components/logo.tsx | 品牌标识展示 |
| ImageUploader | components/image-uploader.tsx | 图片上传与预览 |
| MenuTable | components/menu-table.tsx | 菜品数据表格 (TanStack) |
| MarkupSelector | components/markup-selector.tsx | 溢价比例选择器 |
| ProcessingIndicator | components/processing-indicator.tsx | 加载状态展示 |
| ErrorDisplay | components/error-display.tsx | 错误信息展示 |

---

## 5. 项目目录结构

```
menu-extractor/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页面
│   ├── globals.css         # 全局样式
│   └── api/
│       └── extract/
│           └── route.ts    # API Route (可选)
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── logo.tsx
│   ├── image-uploader.tsx
│   ├── menu-table.tsx
│   ├── markup-selector.tsx
│   ├── processing-indicator.tsx
│   └── error-display.tsx
├── lib/
│   ├── utils.ts            # 工具函数
│   └── gemini.ts           # Gemini API 服务
├── types/
│   └── index.ts            # 类型定义
├── hooks/
│   └── use-media-query.ts  # 响应式 hook
├── .env.local              # 环境变量
├── next.config.js          # Next.js 配置
├── tailwind.config.ts      # Tailwind 配置
├── components.json         # shadcn/ui 配置
├── tsconfig.json           # TypeScript 配置
└── package.json
```

---

## 6. 开发计划

### Phase 1: 项目初始化
1. 创建 Next.js 项目 (App Router)
2. 配置 TypeScript
3. 配置 Tailwind CSS
4. 安装配置 shadcn/ui
5. 安装配置 Radix Colors
6. 安装配置 TanStack Table
7. 安装配置 react-responsive
8. 安装 Lucide React 图标

### Phase 2: 核心功能开发
1. 实现 Gemini API 调用服务
2. 实现图片上传组件
3. 实现图片预览与管理
4. 实现 AI 识别调用逻辑

### Phase 3: 结果展示开发
1. 实现数据表格组件 (TanStack Table)
2. 实现溢价选择器组件
3. 实现溢价计算逻辑
4. 实现结果汇总展示

### Phase 4: 页面整合与优化
1. 整合主页面所有组件
2. 实现状态管理逻辑
3. 实现响应式布局
4. 实现加载与错误状态

### Phase 5: 测试与发布
1. 功能测试
2. 移动端适配测试
3. 性能优化
4. 部署准备

---

## 7. API 调用说明

### 7.1 请求示例

```typescript
const response = await fetch(
  'https://yunwu.ai/v1beta/models/gemini-3-flash-preview:streamGenerateContent?key=YOUR_API_KEY',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: 'base64EncodedImageData...'
            }
          },
          {
            text: '请从提供的餐厅菜单图片中提取所有菜品名称及其价格...'
          }
        ]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  }
);
```

### 7.2 Prompt 设计

```text
请从提供的餐厅菜单图片中提取所有菜品名称及其价格。
返回结构化的项目列表。
确保名称与菜单中显示的完全一致。
价格应提取为数字。如果给出的是价格范围，请使用最低价格。
如果菜单有多个部分，请提取全部内容。

请以 JSON 格式返回，格式如下：
{
  "items": [
    { "name": "菜品名称", "originalPrice": 价格数字 }
  ]
}
```

---

## 8. 非功能需求

### 8.1 性能要求
- 图片上传响应时间 < 500ms
- AI 识别响应时间 < 10s (取决于图片数量)
- 页面首屏加载时间 < 2s

### 8.2 兼容性要求
- 支持 Chrome, Firefox, Safari, Edge 最新版本
- 支持移动端浏览器 (iOS Safari, Chrome for Android)
- 响应式适配: 320px ~ 1920px 屏幕宽度

### 8.3 安全要求
- API Key 存储在环境变量中，不暴露到前端
- 图片数据仅在客户端处理，不持久化存储

---

## 9. 验收标准

1. ✅ 可成功上传单张/多张菜单图片
2. ✅ 图片上传后显示缩略图预览
3. ✅ 可删除已上传的图片
4. ✅ 点击分析后调用 Gemini API 进行识别
5. ✅ 识别结果以表格形式展示
6. ✅ 表格包含菜品名称、基础价格、溢价后价格
7. ✅ 可选择预设溢价比例或自定义输入
8. ✅ 切换溢价比例后表格实时更新
9. ✅ 显示所有菜品溢价后总金额
10. ✅ 处理中显示加载状态
11. ✅ 错误时显示友好提示
12. ✅ 移动端适配良好

---

## 文档版本

| 版本 | 日期 | 修改内容 |
|-----|------|---------|
| v1.0 | 2024-12-24 | 初始版本 |
