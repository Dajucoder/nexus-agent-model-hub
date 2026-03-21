# 部署指南

## 本地 Docker Compose

```bash
# 可选：如需自定义密钥或端口，再复制模板
cp .env.example .env
docker compose up --build
```

如果跳过复制步骤，Docker Compose 也会使用文档中的默认值直接启动。

访问地址：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:4000`
- PostgreSQL：`localhost:5432`
- Redis：`localhost:6379`

## 跨系统说明

### Windows

- 建议 Docker Desktop + WSL2
- 确保 `3000`、`4000`、`5432`、`6379` 端口未被占用
- 建议保持 LF 换行，避免脚本解释问题

### macOS

- Docker Desktop 与 OrbStack 均可
- Apple Silicon 可直接运行，基础镜像支持多架构

### Linux

- 推荐 Docker Engine 24+ 与 Compose Plugin 2.20+
- 如需无 `sudo`，请将当前用户加入 `docker` 组

## 云端部署

### AWS

- 前后端可运行在 ECS Fargate 或 EKS
- 数据库建议 RDS PostgreSQL
- Redis 建议 ElastiCache
- TLS 在 ALB 或 Ingress 终止

### GCP

- 小规模可用 Cloud Run，大规模建议 GKE
- 数据库建议 Cloud SQL
- Redis 建议 Memorystore

### Azure

- 可运行在 Container Apps、AKS 或 App Service for Containers
- 数据库建议 Azure Database for PostgreSQL
- Redis 建议 Azure Cache for Redis

## Kubernetes

- 原生清单位于 `k8s/`
- Helm 草案位于 `helm/nexus-agent-model-hub/`
- 生产部署前必须替换占位密钥

## 生产强化建议

- 数据库与 Redis 优先使用托管服务
- 密钥交给 Secret Manager 或 Vault
- 开启镜像签名与 SBOM
- API 放在 TLS 与 WAF 后面
- 浏览器正式版建议切换为 HttpOnly Cookie 或 BFF 模式，而不是直接在前端保存访问令牌
