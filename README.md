# 📷 光影分享

一个基于 Supabase 和 Netlify 的摄影作品分享与AI评价平台。

## ✨ 功能特性

### 🖼️ 作品展示
- 响应式画廊布局
- 分类筛选（风光、人像、街拍、微距、野生动物、建筑）
- 作品详情展示
- 拍摄参数记录

### 📤 作品上传
- 拖拽上传支持
- 多格式支持（JPG、PNG、GIF）
- 详细的作品信息记录
- 相机参数和拍摄地点
- 文件大小限制（10MB）

### 🤖 AI智能评价
- 构图分析与评分
- 光线评价与建议
- 色彩分析
- 创意亮点识别
- 个性化改进建议
- 评价结果分享

### 💡 摄影技巧
- 专业摄影技巧分享
- 分类整理（构图、光线、色彩、技巧、设备、后期）
- 难度等级标注
- 持续更新的技巧库

## 🏗️ 技术架构

### 前端技术
- **HTML5** + **CSS3** + **Vanilla JavaScript**
- 响应式设计，支持移动端
- 现代化UI界面

### 后端服务
- **Supabase**: 数据库 + 认证 + 存储
- **PostgreSQL**: 关系型数据库
- **AI服务**: 图像分析（可集成OpenAI Vision、Google Vision等）

### 部署平台
- **Netlify**: 静态网站托管
- **CDN加速**: 全球内容分发
- **自动部署**: Git集成

## 📊 数据库设计

### 核心表结构

#### 用户表 (users)
- 用户基本信息
- 个人资料管理

#### 照片表 (photos)
- 作品信息存储
- 分类标签系统
- 拍摄参数记录

#### AI分析表 (ai_analyses)
- AI评价结果
- 分析数据存储
- 评分统计

#### 评论表 (comments)
- 评论系统
- 嵌套评论支持

#### 点赞表 (likes)
- 点赞功能
- 用户互动统计

#### 摄影技巧表 (photography_tips)
- 技巧内容管理
- 分类系统
- 难度分级

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/my-photo-site.git
cd my-photo-site
```

### 2. 配置 Supabase
1. 在 [Supabase](https://supabase.com) 创建新项目
2. 复制项目 URL 和 API Key
3. 在 Supabase Dashboard 中执行 `supabase/schema.sql`
4. 设置 Storage Bucket `photos`

### 3. 配置环境变量
在 `js/config.js` 中更新你的 Supabase 配置：
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 4. 本地开发
```bash
# 安装依赖
npm install

# 启动本地服务器
npm run dev

# 访问 http://localhost:8000
```

### 5. 部署到 Netlify
1. 连接 GitHub 仓库到 Netlify
2. 设置环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `AI_ANALYSIS_ENDPOINT` (可选)
   - `AI_API_KEY` (可选)
3. 自动部署完成

## 📝 环境变量配置

### Supabase 配置
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### AI服务配置（可选）
```
AI_ANALYSIS_ENDPOINT=https://api.example.com/analyze
AI_API_KEY=your-ai-api-key
```

## 🔧 自定义配置

### 添加AI服务
在 `js/ai-feedback.js` 中的 `simulateAIAnalysis` 方法中集成真实的AI服务：

```javascript
// 示例：集成 OpenAI Vision API
async function analyzeWithOpenAI(imageBase64) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AI_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-4-vision-preview",
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "请分析这张照片的构图、光线、色彩和创意，并给出评分（0-100）"
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${imageBase64}`
                        }
                    }
                ]
            }]
        })
    });
    
    return await response.json();
}
```

### 自定义样式
修改 `styles/main.css` 中的CSS变量来自定义主题：

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #f59e0b;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --dark-color: #1f2937;
    --light-color: #f3f4f6;
}
```

## 📱 移动端优化

网站已完全优化移动端体验：
- 响应式布局
- 触摸友好的交互
- 优化的图片加载
- 移动端导航菜单

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果你遇到问题或有建议，请：
1. 查看 [Issues](https://github.com/your-username/my-photo-site/issues)
2. 创建新的 Issue
3. 联系我们：contact@lightshadow.com

## 🗺️ 路线图

### v1.1 (计划中)
- [ ] 用户注册登录系统
- [ ] 社交功能（关注、点赞、评论）
- [ ] 作品搜索功能
- [ ] 个人作品集页面

### v1.2 (计划中)
- [ ] 高级AI分析（更多维度）
- [ ] 作品编辑功能
- [ ] 分享到社交媒体
- [ ] 暗黑模式

### v2.0 (远期计划)
- [ ] 移动App
- [ ] 实时直播功能
- [ ] 作品版权保护
- [ ] 商业化功能

---

**光影分享** - 让每个瞬间都值得记录 📸