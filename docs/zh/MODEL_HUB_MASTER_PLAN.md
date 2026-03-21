# 大模型系统化介绍与实践平台 — 总体方案

> 版本: 1.0.0 | 日期: 2026-03-21 | 状态: 可执行方案

---

## 1. 技术栈与架构

### 1.1 核心技术组合

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Next.js 14+ (App Router) | SSG/ISR/SSR 混合渲染，RSC 支持 |
| 语言 | TypeScript 5.x | 全栈类型安全 |
| 样式 | Tailwind CSS 3.x + CSS Modules | 原子化 + 组件级样式 |
| 内容 | MDX 3.x + Contentlayer2 / 直接 MDX | 文档类内容可组合 |
| 数据层 | Zod + Prisma / Drizzle ORM | 数据校验 + 类型安全 ORM |
| API | tRPC + REST 公开端 | 内部 tRPC，公开 REST |
| 认证 | NextAuth.js v5 (Auth.js) | OAuth + 邮箱 + API Key 管理 |
| 状态 | Zustand (客户端) + React Query | 轻量全局状态 + 服务端缓存 |
| 测试 | Vitest + Playwright | 单元 + E2E |
| 数据库 | PostgreSQL (Neon/Supabase) | 用户数据、API Key、对话记录 |
| 缓存 | Vercel KV / Redis (Upstash) | 排行榜缓存、API 限流 |

### 1.2 架构图（逻辑层）

```
┌─────────────────────────────────────────────────┐
│                   CDN (Vercel Edge)              │
├─────────────────────────────────────────────────┤
│  SSG 页面 (模型卡片/指南)  │  ISR 页面 (排行榜)  │
├─────────────────────────────────────────────────┤
│            Next.js App Router (RSC)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ MDX 内容  │ │ tRPC API │ │ 外部 API 代理层  │ │
│  │ (静态)    │ │ (内部)   │ │ (OpenRouter等)  │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│  PostgreSQL (用户/Key)  │  Redis (缓存/限流)     │
└─────────────────────────────────────────────────┘
```

### 1.3 渲染策略

| 页面类型 | 渲染方式 | 重验证周期 |
|---------|---------|-----------|
| 首页 / 关于 | SSG | 按需 (revalidateTag) |
| 模型卡片详情 | SSG + ISR | 24h |
| 模型对比页 | CSR (客户端计算) | 实时 |
| 排行榜 | ISR | 6h |
| Agent 对话 | SSR / CSR | 实时 |
| 管理后台 | CSR | 实时 |

### 1.4 部署方案

**主方案: Vercel**
- 自动 CI/CD 与 Preview 部署
- Edge Functions (排行榜实时数据)
- Vercel KV (Redis) / Vercel Postgres
- Analytics 集成

**备选: 自托管 (Docker)**
- Docker Compose: Next.js + PostgreSQL + Redis + Nginx
- 适合需要完全控制数据的场景

---

## 2. 信息架构与页面清单

### 2.1 站点地图

```
/                           → 首页（英雄区 + 模型概览 + 最新动态）
/models                     → 模型列表页（筛选/排序/搜索）
/models/[slug]              → 模型详情页（模型卡片）
/compare                    → 模型对比页（选 2-4 个模型对比）
/compare/[...models]        → 预设对比链接
/leaderboard                → 排行榜（聚合多数据源）
/leaderboard/[source]       → 单数据源排行（openrouter/arena/chatbot-arena）
/guides                     → 实践指南列表
/guides/[slug]              → 指南详情（MDX 渲染）
/chat                       → Agent 对话（需配置 API Key）
/settings                   → 用户设置（API Key 管理、代理 URL）
/about                      → 关于本站
/api/*                      → REST API 端点
```

### 2.2 每页核心功能定义

详见 `docs/PAGE_SPEC.md`

---

## 3. 内容数据模型

### 3.1 TypeScript 接口定义

```typescript
// src/types/model.ts

/** 模型能力评分 (0-100) */
interface ModelCapabilityScore {
  reasoning: number;
  coding: number;
  math: number;
  creative_writing: number;
  multilingual: number;
  instruction_following: number;
  vision: number;       // 多模态视觉
  audio: number;        // 语音理解
  tool_use: number;     // 工具调用
}

/** 定价信息 */
interface ModelPricing {
  currency: 'USD';
  input_per_1m_tokens: number;   // 每百万输入 token 价格
  output_per_1m_tokens: number;
  cached_input_per_1m_tokens?: number;
  fine_tuning_per_1m_tokens?: number;
}

/** 上下文窗口 */
interface ContextWindow {
  max_tokens: number;
  max_output_tokens?: number;
  training_cutoff?: string;      // ISO 日期
}

/** API 端点信息 */
interface ApiEndpoint {
  provider: string;
  base_url: string;
  docs_url: string;
  supported_params: string[];
}

/** 供应商信息 */
interface ProviderInfo {
  id: string;
  name: string;
  logo_url: string;
  official_url: string;
  api_key_url: string;         // 获取 API Key 的页面
  docs_url: string;
  pricing_url: string;
}

/** 排行榜数据 */
interface LeaderboardEntry {
  rank: number;
  model_id: string;
  model_name: string;
  score: number;
  category: string;
  source: 'openrouter' | 'arena' | 'custom';
  updated_at: string;
  metadata?: Record<string, unknown>;
}

/** 模型卡片 — 完整定义 */
interface ModelCard {
  // 基本信息
  id: string;                    // slug, 如 "gpt-4o"
  name: string;                  // 显示名
  slug: string;                  // URL slug
  provider: ProviderInfo;
  version?: string;
  release_date: string;
  model_family: string;          // 如 "GPT-4", "Claude", "Gemini"
  
  // 技术规格
  context_window: ContextWindow;
  architecture: 'dense' | 'moe' | 'diffusion' | 'other';
  modality: ('text' | 'image' | 'audio' | 'video' | 'code')[];
  languages: string[];
  
  // 能力与评估
  capabilities: ModelCapabilityScore;
  benchmarks: BenchmarkResult[];
  
  // 商业信息
  pricing: ModelPricing;
  api_endpoints: ApiEndpoint[];
  open_source: boolean;
  license?: string;
  huggingface_url?: string;
  github_url?: string;
  
  // 内容
  description: string;
  strengths: string[];
  limitations: string[];
  use_cases: string[];
  
  // 排行榜关联
  leaderboard_scores: {
    openrouter_score?: number;
    arena_score?: number;
    arena_rank?: number;
  };
  
  // 元数据
  tags: string[];
  status: 'active' | 'deprecated' | 'preview';
  last_updated: string;
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
}

/** 基准测试结果 */
interface BenchmarkResult {
  name: string;           // 如 "MMLU", "HumanEval", "MATH"
  score: number;
  unit: 'percentage' | 'pass@1' | 'custom';
  source_url?: string;
  date_tested?: string;
}
```

### 3.2 JSON Schema (模型卡片)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ModelCard",
  "type": "object",
  "required": ["id", "name", "slug", "provider", "release_date", "model_family", "context_window", "modality", "capabilities", "pricing", "description", "status"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "name": { "type": "string", "minLength": 1 },
    "slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "provider": { "$ref": "#/definitions/ProviderInfo" },
    "context_window": {
      "type": "object",
      "required": ["max_tokens"],
      "properties": {
        "max_tokens": { "type": "integer", "minimum": 1 },
        "max_output_tokens": { "type": "integer" },
        "training_cutoff": { "type": "string", "format": "date" }
      }
    },
    "modality": {
      "type": "array",
      "items": { "enum": ["text", "image", "audio", "video", "code"] },
      "minItems": 1
    },
    "capabilities": { "$ref": "#/definitions/ModelCapabilityScore" },
    "pricing": { "$ref": "#/definitions/ModelPricing" },
    "description": { "type": "string", "minLength": 10 },
    "status": { "enum": ["active", "deprecated", "preview"] }
  }
}
```

### 3.3 模型卡片字段规范与数据来源

| 字段 | 数据来源 | 更新频率 |
|------|---------|---------|
| 基本信息 (id/name/provider) | 官方文档 + OpenRouter API | 新模型发布时 |
| 定价 (pricing) | 官方定价页 + OpenRouter /pricing | 月度 |
| 上下文窗口 | 官方文档 + OpenRouter /models | 月度 |
| 能力评分 | 人工评估 + 基准测试 | 季度 |
| 基准测试 | Papers With Code, 官方技术报告 | 季度 |
| 排行榜分数 | OpenRouter API, LMSYS Arena API | 自动 (6h) |
| 描述/优势/局限 | 编辑撰写 | 按需 |

**数据源引用:**
- OpenRouter: `https://openrouter.ai/api/v1/models`
- LMSYS Chatbot Arena: `https://chat.lmsys.org/elo` / API
- Papers With Code: `https://paperswithcode.com/api/v1/`
- HuggingFace: `https://huggingface.co/api/models`

---

## 4. 模型对比设计

### 4.1 对比维度

```typescript
interface ComparisonDimension {
  id: string;
  label: string;
  category: 'basic' | 'technical' | 'capability' | 'pricing' | 'benchmark';
  render: 'text' | 'number' | 'bar' | 'badge' | 'score-circle';
  sort?: 'asc' | 'desc';
}

const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  { id: 'provider', label: '供应商', category: 'basic', render: 'badge' },
  { id: 'context_window', label: '上下文窗口', category: 'technical', render: 'number', sort: 'desc' },
  { id: 'max_output', label: '最大输出', category: 'technical', render: 'number', sort: 'desc' },
  { id: 'input_price', label: '输入价格 ($/1M)', category: 'pricing', render: 'number', sort: 'asc' },
  { id: 'output_price', label: '输出价格 ($/1M)', category: 'pricing', render: 'number', sort: 'asc' },
  { id: 'reasoning', label: '推理能力', category: 'capability', render: 'score-circle' },
  { id: 'coding', label: '编程能力', category: 'capability', render: 'score-circle' },
  { id: 'math', label: '数学能力', category: 'capability', render: 'score-circle' },
  { id: 'creative_writing', label: '创意写作', category: 'capability', render: 'score-circle' },
  { id: 'multilingual', label: '多语言', category: 'capability', render: 'score-circle' },
  { id: 'tool_use', label: '工具调用', category: 'capability', render: 'score-circle' },
  { id: 'vision', label: '视觉理解', category: 'capability', render: 'score-circle' },
  { id: 'mmlu', label: 'MMLU', category: 'benchmark', render: 'bar' },
  { id: 'humaneval', label: 'HumanEval', category: 'benchmark', render: 'bar' },
];
```

### 4.2 对比 UI 组件

- `ModelSelector` — 搜索 + 多选模型
- `ComparisonTable` — 表格对比 (支持横向滚动)
- `ComparisonRadar` — 雷达图可视化能力对比
- `ComparisonBarChart` — 基准测试柱状图
- `ShareableLink` — 生成分享链接 `/compare/gpt-4o/claude-3-opus/gemini-2.0`

---

## 5. 模型排行榜

### 5.1 数据源集成

```typescript
// OpenRouter 排行榜
interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: { prompt: string; completion: string };
  context_length: number;
  top_provider: { max_completion_tokens: number | null };
}

// Arena (LMSYS) 数据
interface ArenaEntry {
  model: string;
  elo: number;
  ci_low: number;
  ci_high: number;
  votes: number;
  organization: string;
}
```

### 5.2 排行榜页功能

- 多源切换 Tabs (OpenRouter / Arena / 综合)
- 按类别筛选 (Coding, Chat, Creative, Multilingual)
- 实时搜索
- 点击模型名称跳转到模型卡片详情
- 点击供应商跳转到官方文档
- "获取 API Key" 按钮直达供应商 API Key 页面

### 5.3 数据拉取策略

```typescript
// src/lib/leaderboard.ts
// OpenRouter: 使用 /api/v1/models 端点
// Arena: 使用 LMSYS 官方数据 (JSON/CSV)
// 缓存: Vercel KV / Redis, 6小时过期
// 降级: 使用本地 JSON 快照
```

---

## 6. API Key 管理与 Agent 对话模块

### 6.1 API Key 存储

```typescript
interface ApiKeyConfig {
  id: string;
  user_id: string;
  provider: string;           // 'openai' | 'anthropic' | 'google' | ...
  key_encrypted: string;      // AES-256 加密存储
  base_url: string;           // 用户可自定义代理 URL
  label: string;              // 用户自定义标签
  is_default: boolean;
  created_at: string;
  last_used_at?: string;
}
```

- 存储: PostgreSQL + AES-256 加密 (使用 `@noble/ciphers`)
- 传输: 仅在 HTTPS 下传输，不在前端明文暴露
- UI: 用户可在 `/settings` 管理多个供应商的 API Key

### 6.2 代理 URL 配置

用户可配置自定义代理/网关 URL，用于:
- 企业内部 API 网关
- 第三方代理服务 (如 OpenRouter 统一端点)
- 本地模型服务 (Ollama, vLLM)

```typescript
interface ProxyConfig {
  provider: string;
  label: string;
  base_url: string;           // 如 "https://api.openai.com/v1"
  default_model?: string;
  headers?: Record<string, string>;
}
```

### 6.3 Agent 对话模块

```typescript
// 对话数据模型
interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model_id: string;
  provider: string;
  system_prompt?: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  token_count?: number;
  created_at: string;
}
```

**对话实现要点:**
- 使用 Vercel AI SDK (`ai` 包) 处理流式响应
- 支持 SSE (Server-Sent Events) 流式输出
- 支持切换不同模型进行对话
- 支持配置 system prompt
- 对话历史保存在 PostgreSQL
- 限流: 按用户 + API Key 限流 (Redis)

---

## 7. 编辑与审核流程

### 7.1 内容类型

| 内容类型 | 存储格式 | 审核流程 |
|---------|---------|---------|
| 模型卡片 | MDX + JSON frontmatter | 编辑 → 技术审核 → 发布 |
| 实践指南 | MDX | 作者 → 编辑审核 → 发布 |
| 排行榜数据 | 自动拉取 | 自动校验 → 人工抽检 |
| 基准测试 | JSON / YAML | 技术审核 → 发布 |

### 7.2 Git-based CMS 工作流

```
1. 编辑在本地 / CMS (Decap/Tina) 编写内容
2. 提交 PR → 自动 CI 校验 (Schema 验证 + 拼写检查)
3. 技术审核人 Review
4. 合并到 main → 自动部署
```

### 7.3 MDX 内容模板

```markdown
---
id: "gpt-4o"
name: "GPT-4o"
slug: "gpt-4o"
provider_id: "openai"
release_date: "2024-05-13"
model_family: "GPT-4"
status: "active"
tags: ["multimodal", "fast", "reasoning"]
meta_title: "GPT-4o 模型介绍 — 能力、定价与使用指南"
meta_description: "全面了解 OpenAI GPT-4o 模型的技术规格、能力评分..."
keywords: ["GPT-4o", "OpenAI", "多模态", "大模型"]
---

## 概述

GPT-4o 是 OpenAI 于 2024 年 5 月发布的旗舰多模态模型...

## 核心优势

- **多模态原生**: 文本、图像、音频统一处理
- **低延迟**: 比 GPT-4 Turbo 快 2x
- **性价比高**: 定价降低 50%

## 局限性

- 数学推理仍落后于专用模型
- 幻觉问题仍然存在

## 使用建议

1. 适合通用对话和多模态任务
2. 不建议用于高精度数学计算

## API 使用示例

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello" }]
});
\`\`\`
```

---

## 8. SEO 与无障碍优化

### 8.1 SEO 策略

| 技术 | 实现 |
|------|------|
| 结构化数据 | JSON-LD (Article, SoftwareApplication, FAQPage) |
| Sitemap | next-sitemap 自动生成 |
| Meta Tags | 动态生成 (每页独立) |
| Open Graph | 自动生成 OG 图片 (Satori) |
| 语义化 HTML | `<article>`, `<nav>`, `<main>`, `<aside>` |
| 内部链接 | 模型间关联链接、面包屑 |
| 性能 | LCP < 2.5s, CLS < 0.1, FID < 100ms |

### 8.2 无障碍 (WCAG 2.1 AA)

- 所有交互组件支持键盘导航
- ARIA 标签 (aria-label, aria-describedby)
- 颜色对比度 ≥ 4.5:1
- 图片 alt 文本
- 跳过导航链接
- 屏幕阅读器友好图表 (表格替代)

---

## 9. 国际化与本地化

### 9.1 i18n 方案

```typescript
// next-intl 配置
const locales = ['zh-CN', 'en-US', 'ja-JP'] as const;
type Locale = typeof locales[number];

// 路由: /zh-CN/models/gpt-4o, /en/models/gpt-4o
// 默认: zh-CN
// 内容: MDX 按语言分目录
```

### 9.2 本地化文件结构

```
content/
  models/
    zh-CN/
      gpt-4o.mdx
    en-US/
      gpt-4o.mdx
  i18n/
    zh-CN.json    → UI 文本
    en-US.json    → UI 文本
```

---

## 10. 性能与安全

### 10.1 缓存策略

| 资源 | 缓存层 | TTL |
|------|--------|-----|
| 静态页面 (SSG) | CDN Edge | 永久 (按需失效) |
| ISR 页面 | CDN + SWR | 6h |
| 排行榜 API | Redis | 6h |
| 模型列表 | CDN Cache-Control | 24h |
| 对话流 | 不缓存 | - |

### 10.2 安全措施

- **API Key**: AES-256 加密存储，永不明文返回前端
- **CSP**: 严格内容安全策略
- **CSRF**: NextAuth 内置 CSRF 保护
- **Rate Limiting**: 基于 Redis 的滑动窗口限流
- **输入验证**: Zod schema 校验所有 API 输入
- **依赖安全**: Dependabot + `npm audit`
- **CORS**: 严格白名单

---

## 11. 运维与监控

### 11.1 监控栈

| 工具 | 用途 |
|------|------|
| Vercel Analytics | 页面性能 |
| Sentry | 错误追踪 |
| Posthog / Plausible | 用户行为分析 |
| Uptime Robot | 可用性监控 |
| Logtail | 日志聚合 |

### 11.2 告警规则

- 排行榜数据拉取失败 → Slack/邮件告警
- API 错误率 > 5% → Sentry 告警
- 页面加载 > 3s → Vercel Analytics 告警
- 数据库连接异常 → 基础设施告警

---

## 12. 交付物清单

| 交付物 | 格式 | 文件路径 |
|--------|------|---------|
| 总体方案文档 | Markdown | `docs/MASTER_PLAN.md` |
| 页面规格说明 | Markdown | `docs/PAGE_SPEC.md` |
| TypeScript 类型定义 | TypeScript | `src/types/model.ts` |
| JSON Schema | JSON | `src/schemas/model-card.json` |
| MDX 模板 | Markdown | `content/models/_template.mdx` |
| 示例模型数据 | MDX + JSON | `content/models/*.mdx` |
| 代码骨架 | Next.js 项目 | `src/` |
| 部署脚本 | Shell | `scripts/deploy.sh` |
| 环境变量模板 | .env | `.env.example` |
