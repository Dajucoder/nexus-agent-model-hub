# 部署指南

## 1. 部署方式总览

| 场景         | 推荐方式                                   | 适用对象             | 说明                              |
| ------------ | ------------------------------------------ | -------------------- | --------------------------------- |
| 本地开发联调 | Docker Compose                             | 所有开发者           | 最快启动前后端、PostgreSQL、Redis |
| 本地源码运行 | Node.js + PostgreSQL + Redis               | 需要调试源码的开发者 | 适合断点调试和前后端分开运行      |
| 单机试运行   | systemd + Caddy/Nginx                      | Linux 测试机         | 接近生产，但复杂度低              |
| 单机长期运行 | Docker Compose + 反向代理                  | 小团队、自托管       | 易备份、易迁移                    |
| 多机或集群   | Kubernetes / Helm                          | 平台团队             | 适合统一运维与弹性扩缩容          |
| 云托管       | ECS/EKS、Cloud Run/GKE、AKS/Container Apps | 企业环境             | 与云数据库、托管 Redis 组合更稳妥 |

## 2. 最快启动方式：Docker Compose

```bash
# 可选：如需自定义密钥、端口、域名，再复制模板
cp .env.example .env
docker compose up --build
```

访问地址：

- 前端：`http://localhost:3000`
- 文档中心：`http://localhost:3000/docs`
- 后端：`http://localhost:4000`
- 健康检查：`http://localhost:4000/api/v1/health`
- 平台摘要接口：`http://localhost:4000/api/v1/platform/summary`
- PostgreSQL：`localhost:5432`
- Redis：`localhost:6379`

补充说明：

- 现在 `docker-compose.yml` 已经把核心环境变量完整传入前后端容器，`.env` 中修改的 JWT、CORS、Agent 配置会真正生效。
- 首次启动前请优先替换 `JWT_SECRET` 与 `JWT_REFRESH_SECRET`。
- 如需跨域预览，可把 `CORS_ORIGIN` 写成逗号分隔多个来源。
- 当前 Compose 栈已经包含健康检查，并会在依赖服务就绪后再启动后端与前端。

## 3. 关键环境变量

- `APP_NAME` / `APP_VERSION`：用于后端健康检查和平台摘要接口。
- `APP_PORT` / `FRONTEND_PORT`：后端与前端对外端口。
- `DATABASE_URL`：PostgreSQL 连接串。
- `REDIS_URL`：Redis 连接串。
- `JWT_SECRET` / `JWT_REFRESH_SECRET`：访问令牌与刷新令牌签名密钥。
- `CORS_ORIGIN`：支持逗号分隔多个来源，例如 `http://localhost:3000,https://preview.example.com`。
- `NEXT_PUBLIC_API_URL`：前端访问后端的公开地址，例如 `https://api.example.com/api/v1`。
- `AGENT_TIMEOUT_MS`：单次 Agent 执行超时时间。
- `AGENT_CONCURRENCY_LIMIT`：Agent 并发限制。
- `AGENT_HTTP_ALLOWED_HOSTS`：内置 HTTP Agent 可访问的主机白名单。
- `PROVIDER_CONFIG_SECRET`：服务端供应商 API Key 存储加密密钥（AES-256-GCM），生产环境必须配置，开发环境不配置则不加密。
- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`：通用 API 限流窗口与最大请求数。
- `AUTH_RATE_LIMIT_MAX`：每个限流窗口内登录/注册的最大次数。
- `AGENT_RATE_LIMIT_WINDOW_MS` / `AGENT_RATE_LIMIT_MAX`：Agent 执行的限流窗口与最大调用数。

`.env.example` 已提供一套可直接用于本地和 Docker Compose 的默认值，包括本地 PostgreSQL 连接串、便于排查的开发日志格式，以及浏览器联调所需的 localhost 地址。

排行榜说明：

- `/api/leaderboard` 现在会优先尝试抓取 OpenRouter 公共榜单页面；若抓取被拦截、网络异常或页面结构变化，会自动回退到 `packages/frontend/.data/leaderboard-snapshots.json`。
- 如需手动刷新仓库内快照，可执行 `npm run leaderboard:refresh --workspace=packages/frontend`。
- 即使手动刷新时解析不到足够数据，脚本也会保留现有快照，不会把线上榜单直接弄坏。

## 4. 本地源码运行

适合希望调试代码、单独起前端或后端的开发者。

### 4.1 准备依赖

1. 安装 Node.js 20+。
2. 启动 PostgreSQL 16 与 Redis 7。
3. 复制环境变量模板：

```bash
cp .env.example .env
```

### 4.2 安装与初始化

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

初始化后建议先做一次基础校验：

```bash
npm run typecheck
npm run test
```

### 4.3 分别启动前后端

```bash
npm run dev:backend
npm run dev:frontend
```

## 5. Windows / macOS / Linux 说明

### Windows

- 推荐 Docker Desktop + WSL2。
- 如果用本地 Node 运行，建议在 WSL2 中执行而不是在 PowerShell 直接跑。
- 确保 `3000`、`4000`、`5432`、`6379` 没有被其他服务占用。

### macOS

- Docker Desktop 与 OrbStack 均可。
- Apple Silicon 可直接运行，当前基础镜像支持多架构。

### Linux

- 推荐 Docker Engine 24+ 和 Compose Plugin 2.20+。
- 如使用源码运行方式，建议通过 `systemd` 管理后端进程，通过 `Caddy` 或 `Nginx` 反代前后端。

## 6. 单机 Linux 部署：systemd + Caddy

适合一台 Ubuntu / Debian 服务器快速上线。

### 6.1 目录建议

```text
/srv/nexus-agent-model-hub/
├── packages/
├── docs/
├── .env
└── package.json
```

### 6.2 构建

```bash
npm install
npm run db:generate
npm run build
```

### 6.3 systemd 示例

后端服务 `/etc/systemd/system/nexus-backend.service`：

```ini
[Unit]
Description=Nexus Agent Model Hub Backend
After=network.target

[Service]
WorkingDirectory=/srv/nexus-agent-model-hub/packages/backend
EnvironmentFile=/srv/nexus-agent-model-hub/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

前端服务 `/etc/systemd/system/nexus-frontend.service`：

```ini
[Unit]
Description=Nexus Agent Model Hub Frontend
After=network.target

[Service]
WorkingDirectory=/srv/nexus-agent-model-hub/packages/frontend
EnvironmentFile=/srv/nexus-agent-model-hub/.env
ExecStart=/usr/bin/npm run start
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

### 6.4 Caddy 示例

```caddy
app.example.com {
  reverse_proxy 127.0.0.1:3000
}

api.example.com {
  reverse_proxy 127.0.0.1:4000
}
```

## 7. 单机 Linux 部署：PM2 + Nginx

适合熟悉 Node 进程管理的团队。

### 7.1 启动

```bash
pm2 start "npm run start --workspace=packages/backend" --name nexus-backend
pm2 start "npm run start --workspace=packages/frontend" --name nexus-frontend
pm2 save
```

### 7.2 Nginx 反向代理示例

```nginx
server {
  listen 80;
  server_name app.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 8. Docker Compose 生产化建议

如果你打算继续用 Compose 跑生产或预发，建议额外做这些事：

1. 把 PostgreSQL 和 Redis 切换为托管服务，Compose 只保留前后端。
2. 通过 `.env.production` 注入正式域名、正式 `NEXT_PUBLIC_API_URL`、正式 JWT 密钥。
3. 在前面增加 Caddy、Nginx 或云负载均衡做 TLS。
4. 配置卷备份策略，至少覆盖 `.env`、数据库卷与日志。
5. 使用 `docker compose up -d --build` 与镜像版本号管理发布。

## 9. Kubernetes / Helm

- 原生清单位于 `k8s/`
- Helm 草案位于 `helm/nexus-agent-model-hub/`
- 生产部署前必须替换占位密钥

建议：

1. 把数据库与 Redis 放到集群外部托管服务。
2. 使用 Secret 管理 JWT、数据库与第三方 API Key。
3. 为后端和前端配置 readiness / liveness probes。
4. 通过 Ingress 或 Gateway API 做域名与 TLS。
5. 为后端加资源限制和水平扩缩容策略。

## 10. 云平台建议

### AWS

- 前后端：ECS Fargate 或 EKS
- 数据库：RDS PostgreSQL
- Redis：ElastiCache
- TLS：ALB 或 Ingress Controller

### GCP

- 小规模：Cloud Run
- 大规模：GKE
- 数据库：Cloud SQL
- Redis：Memorystore

### Azure

- 前后端：Container Apps、AKS 或 App Service for Containers
- 数据库：Azure Database for PostgreSQL
- Redis：Azure Cache for Redis

## 11. 文档中心与静态资源

- 前端自带 `/docs` 页面，可直接读取仓库内 `docs/` 与根目录核心 Markdown。
- 如果你把前端单独部署到 Vercel 或其他平台，要确保部署产物里包含文档目录。
- 目前 `/settings` 页面已支持服务端持久化供应商配置，配置了 `PROVIDER_CONFIG_SECRET` 后 API Key 会加密存储，Base URL 会校验是否指向官方接入点。但它依旧只适合开发和联调，不应替代正式密钥托管。

## 12. 常见问题

### 前端能打开，但文档页为空

排查：

1. 确认部署产物包含 `docs/` 目录。
2. 确认前端运行目录没有破坏相对路径。
3. 检查 `/api/docs?path=docs/zh/README.md` 是否能直接返回内容。

### 登录成功，但控制台接口报跨域错误

排查：

1. 检查 `CORS_ORIGIN` 是否包含当前前端域名。
2. 检查 `NEXT_PUBLIC_API_URL` 是否指向正确的后端地址。
3. 如果经过反向代理，确认代理保留了 `Host` 与转发头。

### 聊天页没有真实返回

排查：

1. 先到 `/settings` 保存对应供应商的 API Key 和 Base URL。
2. 确认你选择的模型和配置的供应商一致。
3. 检查服务端日志，看是否是上游鉴权或模型名错误。

### `docker compose up --build` 已经启动，但页面还是打不开

排查：

1. 先执行 `docker compose ps`，确认 `frontend` 和 `backend` 都是 healthy。
2. 检查宿主机上的 `3000` 和 `4000` 端口是否被其他服务占用。
3. 在宿主机执行 `curl http://localhost:4000/api/v1/health`，确认后端本身已经可访问。

## 13. 生产强化建议

- 数据库与 Redis 优先使用托管服务
- 密钥交给 Secret Manager 或 Vault
- 开启镜像签名与 SBOM
- API 放在 TLS 与 WAF 后面
- 浏览器正式版建议切换为 HttpOnly Cookie 或 BFF 模式，而不是直接在前端保存访问令牌（已通过 Next.js BFF 认证路由实现）
- `/settings` 页不应作为生产密钥保存机制

## 14. 构建资产说明

- `docker/Dockerfile.backend` 采用多阶段构建，在镜像构建阶段生成 Prisma Client，并在容器启动时执行迁移和 seed。
- `docker/Dockerfile.frontend` 会打包 Next.js standalone 运行时，同时把 `docs/` 与部分根目录 Markdown 带入镜像，保证内置文档中心在部署后仍可使用。
- `.dockerignore` 会排除本地依赖、构建产物、日志与环境文件，避免把无关内容带入 Docker 构建上下文。
