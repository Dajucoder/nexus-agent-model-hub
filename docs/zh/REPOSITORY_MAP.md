# 仓库结构说明

```text
<repo-root>/
├── .github/workflows/              # CI 校验
├── content/                        # 模型内容资源与 MDX
├── docker/                         # 前后端 Dockerfile
├── docs/
│   ├── api/openapi.yaml            # OpenAPI 草案
│   ├── assets/                     # README 架构图与预览图
│   ├── en/                         # 英文文档
│   ├── releases/                   # 版本说明与发布草案
│   └── zh/                         # 中文文档
├── helm/nexus-agent-model-hub/     # Helm 草案
├── k8s/                            # Kubernetes 清单
├── packages/
│   ├── backend/
│   │   ├── prisma/                 # Schema、migration、seed、RLS 说明
│   │   ├── src/agents/             # 内置工具与插件加载器
│   │   ├── src/api/                # 路由与中间件
│   │   ├── src/auth/               # JWT 工具
│   │   ├── src/lib/                # i18n、权限、并发控制
│   │   ├── src/db/                 # Prisma 客户端
│   │   └── tests/                  # 单元测试
│   └── frontend/
│       ├── app/                    # Next.js App Router 页面
│       ├── components/             # 平台与模型百科界面
│       ├── lib/                    # API、会话与模型目录工具
│       └── messages/               # 中英文词典
├── .env.example                    # 环境变量模板
├── LICENSE                         # PolyForm Noncommercial 1.0.0 文本
├── NOTICE                          # Required Notice
├── CONTRIBUTING.md                 # 根目录贡献入口
├── CODE_OF_CONDUCT.md              # 社区行为准则
├── SECURITY.md                     # 私密安全报告策略
├── CHANGELOG.md                    # 版本变更记录
├── COMMERCIAL_LICENSE.md           # 商业授权说明
├── docker-compose.yml              # 最小可运行本地栈
└── README.md                       # 顶层指南
```

## 关键约束

- 所有租户数据访问都必须显式受 `tenantId` 约束。
- 新增用户可见文案时必须同时补齐 `messages/en.json` 与 `messages/zh.json`。
- 新插件尽量放在核心运行时之外，并通过 `AGENT_PLUGIN_PATHS` 动态加载。
- 文档中的许可证说明必须与 `LICENSE`、`NOTICE` 保持一致。

## 构建与交付说明

- `docker/Dockerfile.backend` 使用多阶段构建，构建阶段生成 Prisma Client，并在容器启动时执行 `prisma migrate deploy` 和 seed。
- `docker/Dockerfile.frontend` 构建 Next.js standalone 运行时，并把 `docs/` 与部分根目录 Markdown 一并带入镜像，保证 `/docs` 页面在部署后可用。
- `.github/workflows/ci.yml` 当前实际执行 `npm install`、`npm run db:generate`、`npm run typecheck`、`npm run build`、`npm run test`。
- `docker-compose.yml` 是最小本地运行栈，目前已经包含 PostgreSQL、Redis、backend、frontend 的健康检查。
