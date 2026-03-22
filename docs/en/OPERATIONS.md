# Operations Guide

## 1. Daily Checks

Recommended daily checks:

1. `GET /api/v1/health` returns `status=ok`
2. `GET /api/v1/platform/summary` reports the expected environment, version, and Agent inventory
3. The frontend home page, `/docs`, `/login`, and `/dashboard` all render correctly
4. Database connections, slow queries, and disk growth are within limits
5. Redis memory usage, connection count, and hit rate look normal

## 2. Monitoring Metrics

### Backend

- request volume
- 2xx / 4xx / 5xx ratios
- request latency P50 / P95 / P99
- login failures
- refresh-token invalidations
- Agent success, failure, and timeout counts
- per-tenant Agent concurrency

### Infrastructure

- CPU and memory
- container restart count
- disk usage
- PostgreSQL active connections
- Redis memory pressure and evictions

## 3. Logs

- Use structured JSON logs in production
- Redacted fields already include passwords, hashes, auth headers, refresh tokens, and TOTP secrets
- Separate these streams when possible:
  - application access logs
  - security / auth logs
  - audit logs

Retention guidance:

- application logs: 30 days
- audit logs: 180 days minimum
- security events: 365 days if required by policy

## 4. Backups

- Run logical backups at least every 6 hours for small installations
- Perform a daily restore drill into staging
- Enable WAL archiving or managed point-in-time recovery in production
- Also back up:
  - `.env` or secret manager configuration
  - reverse proxy configuration
  - deployment scripts and release history

## 5. Secret Rotation

Establish a rotation schedule for:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- database credentials
- Redis credentials
- third-party model provider API keys

After rotation:

1. restart affected services
2. validate login, refresh-token flow, and chat calls
3. record the timestamp, operator, and blast radius

## 6. Incident Handling

### Tenant-scoped incident

- Disable the tenant by setting `Tenant.isActive = false`
- Revoke refresh tokens for affected users
- Temporarily remove or rotate related provider configuration if needed

### Authentication incident

- Rotate JWT signing keys
- Invalidate active refresh tokens
- Review recent login and failed-login activity

### Upstream model outage

- Switch provider base URLs or providers through `/settings`
- Let the frontend fall back to local explanation mode if necessary
- Record impacted models and time windows

## 7. Capacity Planning

Watch for:

- backend CPU spikes caused by Agent execution or excessive logging
- database degradation caused by growing audit history
- slower frontend releases caused by large docs or static generation volume

Suggested scaling order:

1. move Postgres and Redis to managed services
2. scale the backend horizontally
3. put frontend static assets and docs behind a CDN
4. add centralized logging, metrics, and alerting

## 8. Release Procedure

1. run `npm run typecheck`
2. run `npm run test`
3. run `npm run build`
4. validate `/api/v1/health` and `/api/v1/platform/summary`
5. validate `/docs`, `/settings`, `/chat`, and `/dashboard`
6. then promote to production

Recommended pre-release spot checks:

- sign in with the seeded bootstrap account or a staging tenant owner
- verify a dashboard API call such as `/api/v1/tenants/current`
- confirm one Agent call succeeds and one expected validation failure returns a stable error shape

## 9. Recommended Alerts

- health endpoint failures
- sustained increase in 5xx rate
- abnormal spike in login failures
- sustained Agent timeout rate
- PostgreSQL disk or connection pressure
- Redis nearing memory exhaustion

## 10. Disaster Recovery Targets

- Suggested RPO: 15 minutes
- Suggested RTO: 2 hours

## 11. Common Troubleshooting Paths

### The docs center is empty

1. confirm the frontend artifact includes `docs/`
2. confirm `/api/docs` can read the expected files
3. confirm the frontend runtime still has the expected working-directory layout

### The settings page saved a key but chat still falls back

1. make sure the configured provider matches the selected model
2. verify the base URL
3. inspect the server logs for upstream auth or model-name errors

### The dashboard cannot load backend overview

1. check `/api/v1/platform/summary`
2. check `NEXT_PUBLIC_API_URL`
3. check CORS and reverse-proxy forwarding headers

### Docker services are running but marked unhealthy

1. check `docker compose logs backend`
2. check `docker compose logs frontend`
3. confirm the health endpoints respond locally on ports `4000` and `3000`
