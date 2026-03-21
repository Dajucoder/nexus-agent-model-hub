# 仓库结构说明

```text
<repo-root>/
├── .github/workflows/              # CI 校验
├── content/                        # 模型内容资源与 MDX
├── docker/                         # 前后端 Dockerfile
├── docs/
│   ├── api/openapi.yaml            # OpenAPI 草案
│   ├── en/                         # 英文文档
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
