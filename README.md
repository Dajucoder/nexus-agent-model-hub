# Nexus Agent Model Hub

[![CI](https://img.shields.io/github/actions/workflow/status/Dajucoder/nexus-agent-model-hub/ci.yml?branch=main&label=CI)](https://github.com/Dajucoder/nexus-agent-model-hub/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-orange)](./LICENSE)
[![Docs](https://img.shields.io/badge/docs-en%20%7C%20zh-blue)](./docs/en/README.md)
[![Node](https://img.shields.io/badge/node-20%2B-43853d)](https://nodejs.org/)

面向认证、Agent 运行、模型资料检索、排行榜和文档中心的一体化多租户源码开放工作台，内置中英文界面与双语文档。

这是一个把多租户认证、Agent 工具调用、模型站能力与部署资产放在同一根目录下的 Monorepo。

[English](./docs/en/README.md) | **中文**

## 项目简介

Nexus Agent Model Hub 适合希望同时获得严格租户隔离、可复用登录系统、内置 Agent 工具调用、双语文档以及可部署基础设施的团队与开发者。它不是只展示界面原型的仓库，而是一套能直接启动、联调、扩展和部署的产品基线。

## 快速预览

下图展示了仓库首页、登录、控制台、模型库和会话工作区的整体风格。

![Quick preview of login, dashboard, model hub, and chat workspace](./docs/assets/quick-preview.svg)

## 架构总览

下图对应当前仓库的高层结构，包括前端、后端、Agent 运行时、数据存储和运维边界。

![Architecture overview for frontend, backend, agent runtime, storage, and operations](./docs/assets/architecture-overview.svg)

## 许可证说明

本仓库使用 **PolyForm Noncommercial 1.0.0**。

- 允许个人学习、研究、测试、教学以及非商业组织内部的非商业使用。
- 商业使用、付费托管、商业化云服务、嵌入商业产品或任何直接创造收入的使用方式，**都需要单独获得商业授权**。
- 这不是 OSI 认可的开源许可证，而是“源码可见 + 默认不可商用”的许可证。

开始使用前，请务必阅读 [LICENSE](./LICENSE)、[NOTICE](./NOTICE) 和 [docs/en/LICENSE_GUIDE.md](./docs/en/LICENSE_GUIDE.md)。

官方许可证地址：https://polyformproject.org/licenses/noncommercial/1.0.0/

## 仓库提供了什么

- 严格按租户边界划分的多租户登录系统
- JWT 访问令牌 + Refresh Token 的认证流程
- 租户级 RBAC 与审计日志能力
- 支持插件注册的内置 Agent 工具调用
- 已整合模型百科、模型对比、排行榜、供应商设置和聊天工作区页面
- 中英文界面与中英文文档
- Docker Compose、Kubernetes、Helm 等部署资产
- OpenAPI 草案、Prisma Schema、数据库迁移、CI 工作流与贡献文档

## 方案基线说明

本仓库遵循既定 Scheme A 的设计精神，并在 [docs/en/SCHEME_A_DECISIONS.md](./docs/en/SCHEME_A_DECISIONS.md) 中记录了主要决策。

关键选择包括：

- 数据库：本仓库文档中的本地、CI 与生产路径统一以 PostgreSQL 为基线
- 认证：提供完整用户认证流程，采用 JWT 与刷新令牌，并补充了 Next.js 客户端接入路径
- Agent 通信：接口契约对 SSE 友好，首个版本内置基础工具
- 部署方式：默认以 Docker 自托管为主，同时保留 Vercel 风格前端托管的可选路径
- 国际化：MVP 默认交付 `zh-CN` 与 `en-US`

## 仓库结构

```text
<repo-root>/
├── .github/workflows/              # CI 工作流
├── content/                        # 模型内容与 MDX 资源
├── docker/                         # 前后端 Dockerfile
├── docs/                           # 中英文文档、OpenAPI、发布说明
├── helm/nexus-agent-model-hub/     # Helm Chart 草案
├── k8s/                            # Kubernetes 清单
├── packages/
│   ├── backend/                    # Express + Prisma API
│   └── frontend/                   # Next.js 前端（平台 + 模型站）
├── LICENSE
├── NOTICE
└── docker-compose.yml
```

更细的目录说明见 `docs/en/REPOSITORY_MAP.md` 和 `docs/zh/REPOSITORY_MAP.md`。

## 快速开始

如果你希望以“本地源码联调”的方式启动，推荐使用下面这组命令：

```bash
# 可选：如需自定义密钥、端口或 API 地址，先复制模板
cp .env.example .env
docker compose up -d postgres redis
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:backend
npm run dev:frontend
```

如果你想最快直接起完整容器栈，也可以使用：

```bash
cp .env.example .env
docker compose up --build
```

启动后可访问：

- Web UI：`http://localhost:3000`
- 文档中心：`http://localhost:3000/docs`
- API 健康检查：`http://localhost:4000/api/v1/health`
- 平台摘要接口：`http://localhost:4000/api/v1/platform/summary`
- OpenAPI 草案：[`docs/api/openapi.yaml`](./docs/api/openapi.yaml)
- 社区治理文件：[CONTRIBUTING](./CONTRIBUTING.md)、[CODE_OF_CONDUCT](./CODE_OF_CONDUCT.md)、[SECURITY](./SECURITY.md)、[CHANGELOG](./CHANGELOG.md)

常用校验命令：

- `npm run typecheck`
- `npm run test`
- `npm run build`
- `./scripts/check.sh`
- `npm run leaderboard:refresh --workspace=packages/frontend`

模型内容说明：

- 如果 `content/models/*.mdx` 中存在与模型 slug 对应的内容文件，前端模型详情页会自动把这部分内容作为知识卡片展示出来。
- 当前已接入示例包括 `gpt-4o`、`gpt-4-1`、`claude-sonnet-4`、`gemini-2-5-pro`、`deepseek-r1`，后续继续补内容时无需额外改页面结构。

常用快捷脚本：

- `npm run bootstrap`：执行引导脚本，安装依赖并提示后续初始化步骤
- `npm run check`：运行完整检查链路
- `npm run typecheck:backend` / `npm run typecheck:frontend`
- `npm run test:backend` / `npm run test:frontend`
- `npm run build:backend` / `npm run build:frontend`

默认预置初始账号：

- Tenant：`primary`
- Email：`owner@primary.local`
- Password：`ChangeMe123!`

## 最小产品验收流程

1. 注册一个租户管理员，或直接使用预置初始账号登录。
2. 打开控制台，确认可以读取当前租户数据。
3. 浏览 `/models`、`/leaderboard`、`/compare`、`/chat`、`/settings` 页面。
4. 在控制台里调用内置 `echo` 或 `calculator` Agent。
5. 查看审计日志与 Agent 运行历史，确认系统链路完整。

## 配置说明

- `CORS_ORIGIN` 支持逗号分隔多个来源，适合前后端分域、预发环境和多入口预览。
- `NEXT_PUBLIC_API_URL` 应指向外部可访问的后端 API 根地址，例如 `https://api.example.com/api/v1`。
- 当前浏览器端为了本地联调效率，仍使用 local storage 保存引导式会话；生产浏览器部署建议切换为 HttpOnly Cookie 或 BFF。
- `/settings` 页面会把本地开发用的供应商配置持久化到文件，但它不能替代生产环境的密钥管理系统。

## 配置快照

- 后端标识：`APP_NAME`、`APP_VERSION`、`APP_PORT`
- 数据服务：`DATABASE_URL`、`REDIS_URL`
- 鉴权：`JWT_SECRET`、`JWT_REFRESH_SECRET`、`JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`
- 浏览器/API 连接：`CORS_ORIGIN`、`NEXT_PUBLIC_API_URL`、`FRONTEND_URL`
- Agent 控制：`AGENT_TIMEOUT_MS`、`AGENT_MAX_RETRIES`、`AGENT_CONCURRENCY_LIMIT`、`AGENT_HTTP_ALLOWED_HOSTS`
- 开发默认值：`LOG_LEVEL=info`、`LOG_FORMAT=pretty`

## 文档导航

- 站内文档中心：启动前端后访问 `/docs`
- 英文总览：`docs/en/README.md`
- 中文总览：`docs/zh/README.md`
- 产品就绪度：`docs/en/PRODUCT_READYNESS.md`
- 架构设计：`docs/en/ARCHITECTURE.md`
- 部署指南：`docs/en/DEPLOYMENT.md`
- 运维手册：`docs/en/OPERATIONS.md`
- 贡献指南：`docs/en/CONTRIBUTING.md`
- 许可证指南：`docs/en/LICENSE_GUIDE.md`
- 发布说明：`docs/releases/v0.1.0.md`
- 示例说明：`examples/README.md`
- 模型站规划文档：`docs/zh/MODEL_HUB_MASTER_PLAN.md`
- 页面规格文档：`docs/zh/MODEL_HUB_PAGE_SPEC.md`

## 构建与交付补充说明

- 后端镜像：`docker/Dockerfile.backend` 使用多阶段构建，在构建阶段生成 Prisma Client，并在容器启动时执行数据库迁移与 seed。
- 前端镜像：`docker/Dockerfile.frontend` 使用 Next.js standalone 产物，同时把 `docs/` 和部分根目录 Markdown 带入镜像，确保部署后 `/docs` 页面仍能读取文档内容。
- CI 流程：`.github/workflows/ci.yml` 当前会执行 `npm install`、`npm run db:generate`、`npm run typecheck`、`npm run build`、`npm run test`。
- 本地最小栈：`docker-compose.yml` 现在包含 PostgreSQL、Redis、backend、frontend 的健康检查，适合做联调和故障定位。
- 构建上下文控制：`.dockerignore` 会排除本地依赖、构建产物、日志和环境文件，避免把无关内容带进镜像构建上下文。
- CI 可维护性：工作流现在给每个关键步骤加了命名，便于在 GitHub Actions 中快速定位失败阶段。

## 社区与仓库治理文件

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `COMMERCIAL_LICENSE.md`

## 一个重要的合规澄清

仓库早期草稿里偶尔出现过 AGPL 相关表述，但那并不适合表达“默认不可商用”的边界。AGPL 本身并不禁止商业使用。

当前仓库已经统一为 PolyForm Noncommercial 1.0.0，因此代码、部署说明、贡献文档和许可证说明都应以这一许可边界为准。
