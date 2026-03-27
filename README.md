# 外卖菜单智能识别工具

基于 AI 技术的外卖菜单智能识别与整理工具，帮助商家快速完成菜品数字化，支持美团、饿了么等平台批量上架。

## 功能特性

- **图片上传**：支持单张/多张菜单图片上传，支持拖拽上传
- **AI 识别**：使用 Gemini 3 Flash Preview 模型精准提取菜品名称和价格
- **溢价设置**：支持预设比例（0%、10%、20%、30%、35%、50%）和自定义输入
- **数据展示**：使用 TanStack Table 展示识别结果
- **响应式设计**：完美适配桌面端和移动端

## 技术栈

| 类别 | 技术 |
|-----|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| UI 组件 | shadcn/ui |
| 图标 | Lucide React |
| 配色系统 | Radix Colors |
| 表格库 | TanStack Table v8 |
| 响应式工具 | react-responsive |

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
YUNWU_API_KEY=your_api_key_here
YUNWU_API_BASE=https://yunwu.ai/v1beta
YUNWU_MODEL=gemini-3-flash-preview
```

`YUNWU_MODEL` 用于控制当前调用的模型名称。未配置时，系统默认使用 `gemini-3-flash-preview`。

### Vercel 环境变量

如果项目部署在 Vercel，请在项目的 `Settings > Environment Variables` 中添加以下变量：

```env
YUNWU_API_KEY=your_api_key_here
YUNWU_API_BASE=https://yunwu.ai/v1beta
YUNWU_MODEL=gemini-3-flash-preview
```

之后只需要在 Vercel 修改 `YUNWU_MODEL`，就可以切换不同模型，无需改代码重新提交。

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
npm start
```

## 项目结构

```
├── app/
│   ├── api/extract/route.ts  # API 路由 - Gemini AI 调用
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 主页面
├── components/
│   ├── ui/                   # shadcn/ui 基础组件
│   ├── error-display.tsx     # 错误提示组件
│   ├── image-uploader.tsx    # 图片上传组件
│   ├── logo.tsx              # Logo 组件
│   ├── markup-selector.tsx   # 溢价选择器组件
│   ├── menu-table.tsx        # 菜单表格组件
│   └── processing-indicator.tsx # 处理中状态组件
├── hooks/
│   └── use-media-query.ts    # 响应式 hooks
├── lib/
│   └── utils.ts              # 工具函数
├── types/
│   └── index.ts              # TypeScript 类型定义
└── docs/
    └── PRD.md                # 产品需求文档
```

## 使用流程

1. 上传一张或多张菜单图片
2. 点击「立即开始 AI 提取」按钮
3. 等待 AI 分析完成
4. 在结果页面设置溢价比例
5. 查看溢价后的菜品定价

## API 说明

项目使用云雾 AI 提供的 Gemini API 服务：

- **模型**: `gemini-3-flash-preview`
- **环境变量**: 可通过 `YUNWU_MODEL` 覆盖默认模型
- **端点**: `https://yunwu.ai/v1beta/models/gemini-3-flash-preview:generateContent`
- **认证方式**: Query Parameter (`key`)
- **请求格式**: JSON (Base64 图片 + 文本提示)

## 许可证

MIT License
