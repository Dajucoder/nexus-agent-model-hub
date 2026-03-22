# Deployment Guide

## 1. Deployment Matrix

| Scenario | Recommended approach | Best for | Notes |
| --- | --- | --- | --- |
| Local development | Docker Compose | All developers | Fastest way to boot frontend, backend, PostgreSQL, and Redis |
| Local source debugging | Node.js + PostgreSQL + Redis | Engineers debugging code | Best for breakpoints and split frontend/backend workflows |
| Single-host trial deployment | systemd + Caddy/Nginx | Linux test servers | Close to production with low complexity |
| Small self-hosted production | Docker Compose + reverse proxy | Small teams | Easy to back up and migrate |
| Clustered deployment | Kubernetes / Helm | Platform teams | Good for shared operations and scaling |
| Cloud-managed deployment | ECS/EKS, Cloud Run/GKE, AKS/Container Apps | Enterprise teams | Pairs well with managed Postgres and Redis |

## 2. Fastest Start: Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Docs center: `http://localhost:3000/docs`
- Backend: `http://localhost:4000`
- Health endpoint: `http://localhost:4000/api/v1/health`
- Platform summary endpoint: `http://localhost:4000/api/v1/platform/summary`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Notes:

- `docker-compose.yml` now passes the important runtime variables into the backend and frontend containers, so `.env` overrides actually reach the running services.
- Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` before any real deployment.
- `CORS_ORIGIN` supports comma-separated origins for preview or split-domain setups.

## 3. Important Environment Variables

- `APP_NAME` / `APP_VERSION`: exposed by health and platform summary endpoints.
- `APP_PORT` / `FRONTEND_PORT`: published service ports.
- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_URL`: Redis connection string.
- `JWT_SECRET` / `JWT_REFRESH_SECRET`: signing keys for access and refresh tokens.
- `CORS_ORIGIN`: comma-separated allowed browser origins.
- `NEXT_PUBLIC_API_URL`: public backend base URL used by the frontend.
- `AGENT_TIMEOUT_MS`: per-run Agent timeout.
- `AGENT_CONCURRENCY_LIMIT`: Agent concurrency cap.
- `AGENT_HTTP_ALLOWED_HOSTS`: outbound allowlist for the built-in HTTP Agent tool.

## 4. Local Source Mode

Use this when you want to debug the code directly.

### 4.1 Prerequisites

1. Install Node.js 20+.
2. Start PostgreSQL 16 and Redis 7.
3. Copy the environment template:

```bash
cp .env.example .env
```

### 4.2 Install and initialize

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4.3 Start services separately

```bash
npm run dev:backend
npm run dev:frontend
```

## 5. Windows / macOS / Linux Notes

### Windows

- Prefer Docker Desktop with WSL2 enabled.
- If you run from source, using WSL2 is recommended over native PowerShell for the full stack.
- Make sure ports `3000`, `4000`, `5432`, and `6379` are free.

### macOS

- Docker Desktop and OrbStack both work.
- Apple Silicon is supported by the current base images.

### Linux

- Docker Engine 24+ and Compose Plugin 2.20+ are recommended.
- For source deployments, `systemd` plus `Caddy` or `Nginx` is the simplest stable setup.

## 6. Single Linux Host: systemd + Caddy

Recommended for a small Ubuntu or Debian VM.

### 6.1 Suggested directory layout

```text
/srv/nexus-agent-model-hub/
├── packages/
├── docs/
├── .env
└── package.json
```

### 6.2 Build

```bash
npm install
npm run db:generate
npm run build
```

### 6.3 systemd example

Backend service:

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

Frontend service:

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

### 6.4 Caddy example

```caddy
app.example.com {
  reverse_proxy 127.0.0.1:3000
}

api.example.com {
  reverse_proxy 127.0.0.1:4000
}
```

## 7. Single Host: PM2 + Nginx

Recommended for teams already using Node process managers.

### 7.1 Start processes

```bash
pm2 start "npm run start --workspace=packages/backend" --name nexus-backend
pm2 start "npm run start --workspace=packages/frontend" --name nexus-frontend
pm2 save
```

### 7.2 Nginx example

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

## 8. Production Docker Compose Guidance

If you continue using Compose for staging or production:

1. Move PostgreSQL and Redis to managed services whenever possible.
2. Use a dedicated `.env.production` with real domains and secrets.
3. Put Caddy, Nginx, or a cloud load balancer in front for TLS.
4. Back up database volumes, `.env`, and deployment metadata.
5. Use tagged images or controlled rebuilds for repeatable releases.

## 9. Kubernetes / Helm

- Raw manifests live in `k8s/`
- Helm chart draft lives in `helm/nexus-agent-model-hub/`
- Replace placeholder secrets before production rollout

Recommended baseline:

1. Keep Postgres and Redis outside the cluster unless you have strong SRE support.
2. Store JWT, database, and provider credentials in Kubernetes Secrets or an external secret manager.
3. Add readiness and liveness probes for frontend and backend.
4. Terminate TLS at ingress or gateway.
5. Define resource requests, limits, and autoscaling for the backend.

## 10. Cloud Platform Recommendations

### AWS

- Frontend and backend: ECS Fargate or EKS
- Database: RDS PostgreSQL
- Redis: ElastiCache
- TLS: ALB or ingress controller

### GCP

- Small scale: Cloud Run
- Larger scale: GKE
- Database: Cloud SQL
- Redis: Memorystore

### Azure

- Frontend and backend: Container Apps, AKS, or App Service for Containers
- Database: Azure Database for PostgreSQL
- Redis: Azure Cache for Redis

## 11. Docs Center and Static Assets

- The frontend ships with `/docs`, which reads the repository Markdown directly.
- If you deploy the frontend separately, make sure the `docs/` directory is included in the runtime artifact.
- The `/settings` page now persists local provider configuration for development, but it is still not a production-grade secret backend.

## 12. Troubleshooting

### The frontend works but `/docs` is empty

Check:

1. The deployed artifact includes the `docs/` directory.
2. The frontend runtime preserves the expected working directory layout.
3. `/api/docs?path=docs/en/README.md` returns content directly.

### Login works but dashboard API calls fail with CORS

Check:

1. `CORS_ORIGIN` includes the active frontend origin.
2. `NEXT_PUBLIC_API_URL` points to the correct public backend URL.
3. Your reverse proxy forwards `Host` and `X-Forwarded-*` headers correctly.

### The chat page does not return real model output

Check:

1. Save the matching provider API key and base URL under `/settings`.
2. Make sure the selected model and the configured provider match.
3. Inspect server logs for upstream auth or model-name errors.

## 13. Production Hardening

- Use managed Postgres and Redis
- Move secrets to a secret manager
- Enable image signing and SBOM generation
- Put the API behind TLS and a WAF
- Use HTTP-only secure cookies or a BFF pattern for browser sessions
- Treat `/settings` as a developer convenience, not a production secrets backend
