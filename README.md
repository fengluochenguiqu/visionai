# VisionAI - 智能图像识别平台

基于视觉大模型的智能图像识别应用，支持多种分析模式。

## 功能特性

- 🖼️ **图片上传**：支持拖拽、点击上传和剪贴板粘贴
- 🤖 **多模型支持**：GLM-4V-Flash / GPT-4V
- 📊 **五种分析模式**：
  - 智能描述：详细描述图片内容
  - 物体识别：识别图中所有物体
  - 场景分析：分析场景与氛围
  - 文字识别：提取图片中的文字（OCR）
  - 色彩分析：分析色彩构成与搭配
- ⚡ **流式输出**：实时显示分析结果，打字机效果
- 📝 **历史记录**：本地存储分析历史，支持分页浏览

## 技术栈

- **前端**：React 18 + TypeScript + Vite
- **样式**：TailwindCSS 3
- **状态管理**：Zustand
- **图标**：Lucide React
- **服务端**：Vercel Edge Functions
- **AI SDK**：OpenAI SDK + AI SDK

## 环境要求

- Node.js >= 20.0.0
- npm >= 9.0.0

## 安装

```bash
npm install
```

## 配置

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# 智谱 API Key（必填）
ZHIPU_API_KEY=your_zhipu_api_key

# OpenAI API Key（可选，用于 GPT-4V）
OPENAI_API_KEY=your_openai_api_key
```

### 获取 API Key

1. **智谱 GLM-4V**：https://open.bigmodel.cn/
2. **OpenAI GPT-4V**：https://platform.openai.com/

## 运行

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
visionai/
├── api/                    # Vercel Edge Functions
│   └── analyze.ts          # 图像分析 API
├── public/                 # 静态资源
│   └── favicon.svg
├── src/
│   ├── components/         # UI 组件
│   │   ├── ImageUpload.tsx    # 图片上传组件
│   │   ├── ModeSelector.tsx   # 模式选择组件
│   │   ├── Navbar.tsx         # 导航栏
│   │   ├── ParticleBackground.tsx  # 粒子背景
│   │   └── ResultDisplay.tsx   # 结果展示组件
│   ├── pages/              # 页面组件
│   │   ├── Analyze.tsx        # 分析页面
│   │   ├── Home.tsx           # 首页
│   │   └── History.tsx        # 历史记录页面
│   ├── services/           # 服务层
│   │   └── api.ts          # API 客户端
│   ├── store/              # 状态管理
│   │   └── analysisStore.ts   # 分析状态
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── tailwind.config.js      # TailwindCSS 配置
```

## API 接口

### POST /api/analyze

图像分析接口

**请求体：**
```json
{
  "imageBase64": "base64_encoded_image",
  "mode": "describe|object|scene|ocr|color",
  "model": "glm-4v|gpt-4v"
}
```

**响应：** 流式文本响应（SSE）

## 部署

### Vercel（推荐）

1. Fork 本仓库
2. 在 Vercel 中导入项目
3. 添加环境变量：
   - `ZHIPU_API_KEY`
   - `OPENAI_API_KEY`（可选）
4. 点击 Deploy

### 本地部署

```bash
npm run build
npm run preview
```

## 许可证

MIT License

## 作者

Fengluochenguiqu

---

**项目链接**：https://visionai-ruby.vercel.app  
**代码仓库**：https://github.com/fengluochenguiqu/visionai
