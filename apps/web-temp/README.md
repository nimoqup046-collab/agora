# AGORA Web Application

全新的 AGORA 前端界面，采用 agora-swarm-terminal 的视觉风格，集成现有后端 API。

## 🎨 特性

- ✨ 5种智能体模式（编程、科研、推理、进化、创作）
- 🖥️ 黑客帝国风格的数字雨背景
- 🎭 丰富的动画效果和粒子背景
- 🤖 真实的 Agent 协作功能
- 💬 实时会话管理和消息流
- 📝 Monaco Editor 代码编辑器
- 🔄 ReactFlow 流程图可视化

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
# 启动开发服务器
npm run dev
```

### 构建生产版本
```bash
npm run build
npm run preview
```

## 🔗 API 集成

前端通过以下 API 与后端通信：

- `/health` - 健康检查
- `/agents` - Agent 管理
- `/sessions` - 会话管理
- `/council` - Council 协作

## 📦 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- Framer Motion
- Zustand
- Monaco Editor
- ReactFlow

## 🎯 模式说明

### 1. 编程模式 (Programming Mode)
- 蜂群编程环境
- 黑客帝国数字雨效果
- 6个 Agent 可视化
- Monaco Editor 代码编辑

### 2. 科研模式 (Research Mode)
- ReactFlow 流程图
- 知识球体3D可视化
- Wolfram MCP 验证集成

### 3. 推理模式 (Reasoning Mode)
- 逻辑链可视化
- 并行辩论系统

### 4. AGI自进化 (Evolution Mode)
- DNA螺旋动画
- 进化树状图
- 遗传参数配置

### 5. 创作模式 (Creation Mode)
- 实时渲染
- 迭代历史

## 🔐 环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
VITE_API_URL=http://localhost:8000
```

## 📝 部署

### Docker
```bash
docker build -t agora-web .
docker run -p 3000:80 agora-web
```

### Railway
通过 `render.yaml` 自动部署

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

## 📄 许可证

MIT License
