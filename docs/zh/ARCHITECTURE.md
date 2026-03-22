# 架构设计

## 设计原则

- 租户身份在每一次状态变更中都是显式上下文。
- 认证与授权分层，避免把角色判断写死到界面层。
- Agent 执行层与 HTTP 层解耦，便于插件扩展。
- 文档、部署、合规资产与代码同仓维护。
- 所有可见文案都必须可国际化替换。

## 文字版体系结构图

1. `Next.js 前端`
   负责双语界面、登录与仪表盘交互，通过 BFF 认证层使用 HttpOnly Cookie 管理会话，通过 HTTPS 调用 API。
2. `Express API`
   提供认证、租户、用户、Agent 路由，执行 RBAC 和租户级过滤。
3. `PostgreSQL`
   存储租户、用户、角色、刷新令牌、审计日志与 Agent 运行记录。
4. `Redis`
   预留给限流、瞬时协调、后续异步任务。
5. `Agent 注册表`
   负责内置工具和插件加载。
6. `可观测性`
   结构化日志、健康检查、指标边界、追踪预留点。
7. `CI/CD`
   GitHub Actions 负责类型检查、构建、测试；Docker/K8s/Helm 负责部署。

## 模块边界

- `frontend`
  只做界面与 API 交互，不直接接触数据库。
- `backend/api`
  负责路由、鉴权、错误映射、OpenAPI 一致性。
- `backend/services`
  负责认证、租户、用户、Agent 等业务逻辑。
- `backend/agents`
  负责注册、插件发现、超时与重试。
- `backend/db`
  负责 Prisma 客户端和迁移资产。

## 多租户隔离

- 第一层：ORM 查询必须显式携带 `tenantId` 条件。
- 第二层：如需更强隔离，可按 `packages/backend/prisma/init.sql` 中的说明在生产环境补充 PostgreSQL RLS。
- 第三层：认证事件、用户管理、Agent 调用全量记录审计日志。

## 错误处理与回滚

- 请求校验使用 Zod。
- 业务错误返回稳定错误码。
- 多步写操作统一走数据库事务。
- Agent 执行采用“先写运行记录，再执行，再落最终状态”的模式，保证可追溯。

## 版本管理

- API 版本：`/api/v1`
- 数据库迁移：Prisma 时间戳目录
- 容器标签：建议 `vX.Y.Z`、`sha-<gitsha>`、`latest`

## 可维护性与扩展性

- 新 Agent 工具优先通过注册表和外部插件加载器接入，而不是直接改路由层。
- 即使生产启用了 RLS，业务层也继续保留显式 `tenantId` 过滤，形成纵深防御。
- API 演进优先并行增加新版本，而不是直接破坏 `/api/v1`。
- 技术债建议通过 ADR 或 `security`、`scalability`、`migration` 等 issue 标签持续管理。
- 前端文档中心依赖运行时仍能读取仓库 Markdown，因此部署产物需要保留 `docs/` 与部分根目录说明文件。
