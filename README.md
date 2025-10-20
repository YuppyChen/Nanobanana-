
# Nanobanana 图像工作室 (AI Image Studio)

✨ 一款功能强大的 Web 应用，利用 Google 最新的 `gemini-2.5-flash-image` (Nanobanana) 模型，将您的创意文本和图像转化为令人惊叹的视觉艺术品。

<!-- 在此添加一张应用截图！ -->
<!-- ![Nanobanana AI Image Studio Screenshot](path/to/your/screenshot.png) -->

## 🌟 主要功能

- **🎨 多模式创作**:
    - **文生图 (Text-to-Image)**: 输入描述性的文本提示词，生成高质量图像。
    - **图生图 (Image-to-Image)**: 上传一张现有图片，结合提示词进行修改、混搭或风格迁移。

- **🚀 AI 提示词助手**:
    - **灵感生成**: 卡壳了？点击“灯泡”按钮，AI 会为您提供一个充满想象力的全新提示词。
    - **提示词优化**: 将您的简单想法输入，点击“魔法棒”按钮，AI 会自动将其丰富和优化为细节详尽、效果更佳的专业级提示词。

- **🖼️ 内置图像编辑器**:
    - 无需离开应用即可对生成的图像进行裁剪、旋转、调整亮度和对比度。
    - 编辑后的图像可以直接用作图生图的输入，实现流畅的创作迭代。

- **📚 个人资产库**:
    - 所有生成的图像都会自动保存在您的浏览器本地（使用 IndexedDB），方便随时回顾和再次使用。
    - 浏览、预览、删除或重新加载您过去的作品作为新的创作起点。

- **⚙️ 灵活配置**:
    - **多种宽高比**: 在文生图模式下，支持从 `1:1` 到 `21:9` 等 10 种常用宽高比。
    - **自定义 API Key**: 在设置中轻松配置您自己的 Gemini API 密钥，密钥将安全地存储在浏览器本地存储中。

## 🛠️ 技术栈

- **前端框架**: [React](https://react.dev/)
- **AI 模型**: [Google Gemini API (`@google/genai`)](https://ai.google.dev/)
- **UI 样式**: [Tailwind CSS](https://tailwindcss.com/)
- **本地存储**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (用于资产库)
- **图像编辑**: [React Image Crop](https://www.npmjs.com/package/react-image-crop)

## 🚀 本地开发启动教程

按照以下步骤在您的本地计算机上运行本项目。

### 1. 先决条件

- [Node.js](https://nodejs.org/) (建议使用 v18 或更高版本)
- [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装)

### 2. 克隆仓库

```bash
git clone <repository-url>
cd <repository-directory>
```

### 3. 安装依赖

本项目使用 `npm` 作为包管理器。

```bash
npm install
```

### 4. 配置 API 密钥

您有两种方式配置 Google Gemini API 密钥：

-   **（推荐）应用内设置**: 启动应用后，点击右上角的“设置”图标，输入您的 API 密钥。该密钥将安全地保存在浏览器本地，优先级最高。
-   **（备选）环境变量**: 在项目根目录创建一个名为 `.env` 或 `.env.local` 的文件，并添加您的密钥：
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```

### 5. 启动开发服务器

```bash
npm run dev
```

服务器启动后，在浏览器中打开 `http://localhost:5173` (或终端提示的端口号) 即可访问应用。

## 🤝 贡献

欢迎提交问题 (issues) 和拉取请求 (pull requests)。如果您有任何改进建议或功能请求，请随时提出！
