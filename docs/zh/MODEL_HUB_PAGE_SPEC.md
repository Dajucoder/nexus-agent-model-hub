# 页面规格说明

## 首页 (`/`)

| 项目 | 说明 |
|------|------|
| 渲染方式 | SSG |
| 核心组件 | HeroSection, FeaturedModels, QuickStats, CTA |
| 数据源 | 本地模型数据 |
| SEO | 首页 meta + JSON-LD (WebSite) |

### Hero Section
- 标题: "主流大模型系统化百科"
- 副标题: 一站式介绍
- CTA 按钮: 浏览模型库 / 查看排行榜 / 模型对比

### Featured Models
- 展示 4 个热门模型的 compact 卡片
- 点击跳转到 `/models/[slug]`

### Quick Stats
- 模型收录数、供应商数、评估维度、更新频率

---

## 模型列表页 (`/models`)

| 项目 | 说明 |
|------|------|
| 渲染方式 | CSR (客户端筛选) |
| 核心组件 | SearchBar, ProviderFilter, ModelGrid |
| 数据源 | 本地模型数据 |
| SEO | 列表页 meta + JSON-LD (ItemList) |

### 功能
- 搜索: 按名称/描述/标签模糊搜索
- 筛选: 按供应商筛选
- 排序: 默认按发布日期倒序
- 网格展示: 响应式 1/2/3 列

---

## 模型详情页 (`/models/[slug]`)

| 项目 | 说明 |
|------|------|
| 渲染方式 | SSG + ISR (24h) |
| 核心组件 | Breadcrumb, ModelHeader, SpecGrid, CapabilityBars, BenchmarkTable, StrengthsWeaknesses |
| 路由参数 | slug: string |
| SEO | 动态 meta + JSON-LD (SoftwareApplication) |

### 页面区块
1. 面包屑导航
2. 模型名称 + 供应商 + 版本 + 标签
3. 操作按钮 (获取 Key, 官方文档, 定价)
4. 概述描述
5. 技术规格网格 (8个指标)
6. 支持模态标签
7. 能力评分 (进度条, 9个维度)
8. 基准测试表格
9. 优势 vs 局限性
10. 推荐使用场景
11. 排行榜表现
12. 相关模型链接
13. 对比 CTA

---

## 模型对比页 (`/compare`)

| 项目 | 说明 |
|------|------|
| 渲染方式 | CSR |
| 核心组件 | ModelSelector, ComparisonTable, CapabilityBars |
| SEO | 静态 meta |

### 功能
- 多选模型 (2-4 个)
- 表格对比 (基本信息/技术规格/能力/基准测试)
- 能力条形图对比
- 分享链接生成

---

## 排行榜页 (`/leaderboard`)

| 项目 | 说明 |
|------|------|
| 渲染方式 | ISR (6h) + 客户端刷新 |
| 核心组件 | SourceTabs, LeaderboardTable, RefreshButton |
| 数据源 | /api/leaderboard (OpenRouter + Arena) |
| SEO | 静态 meta + 列表结构 |

### 数据源
1. **Chatbot Arena**: ELO 评分排名
2. **OpenRouter**: 按上下文长度排序
3. **综合排名**: 合并排名

### 每行操作
- 点击模型名 → 跳转模型详情
- 📖 文档 → 跳转供应商文档
- 🔑 API Key → 跳转获取 Key 页面

---

## 对话页 (`/chat`)

| 项目 | 说明 |
|------|------|
| 渲染方式 | CSR |
| 核心组件 | ModelSelector, ChatMessages, ChatInput, SystemPromptEditor |
| API | POST /api/chat (SSE 流式) |

### 功能
- 模型切换 (下拉选择)
- System Prompt 配置
- 流式消息输出
- 对话历史
- 清空对话

---

## 设置页 (`/settings`)

| 项目 | 说明 |
|------|------|
| 渲染方式 | CSR |
| 核心组件 | ProviderConfigCard |
| API | POST/GET /api/settings/api-key |

### 每个供应商配置卡片
- API Key 输入 (密码模式, 可切换显示)
- 代理 URL 输入 (可选)
- 文档链接 / 获取 Key 链接
- 保存按钮
- 安全说明

---

## REST API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/leaderboard` | GET | 排行榜数据 (6h 缓存) |
| `/api/chat` | POST | 对话代理 (SSE 流式) |
| `/api/settings/api-key` | GET | 获取已配置供应商列表 |
| `/api/settings/api-key` | POST | 保存 API Key 配置 |
