# Architecture

## Design Principles

- Tenant identity is explicit in every state-changing operation.
- Authentication and authorization are separate concerns.
- Agent execution is pluggable and isolated from the HTTP layer.
- Documentation, deployment, and compliance assets live in the same repository.
- Every user-visible string is localizable.

## Text Architecture Diagram

1. `Next.js frontend`
   Renders bilingual login and dashboard views, stores bootstrap browser session state for local rollout, and calls the API over HTTPS.
2. `Express API`
   Handles auth, tenant, user, and Agent routes. Enforces RBAC and tenant-aware query filters.
3. `PostgreSQL`
   Stores tenants, users, roles, refresh tokens, audit logs, and Agent run history.
4. `Redis`
   Reserved for rate limit state, transient job coordination, and future background workers.
5. `Agent registry`
   Loads built-in tools and optional plugins from configured paths.
6. `Observability`
   Structured logs, health endpoint, readiness conventions, metrics-ready service boundaries.
7. `CI/CD`
   GitHub Actions validates type safety, build, and tests. Docker and Kubernetes assets support promotion to staging and production.

## Module Boundaries

- `frontend`
  UI only. No privileged database access.
- `backend/api`
  Request parsing, auth middleware, error mapping, OpenAPI-aligned responses.
- `backend/services`
  Business rules such as auth, tenant management, and Agent execution orchestration.
- `backend/agents`
  Registry, plugin loader, built-in tools, retry and timeout policies.
- `backend/db`
  Prisma client and migration assets.

## Data Isolation Strategy

- Primary guard: tenant-aware filters in every ORM query path.
- Secondary guard: optional PostgreSQL RLS policies are documented in `packages/backend/prisma/init.sql` for hardened production deployments.
- Tertiary guard: audit records for authentication events, user administration, and Agent execution.

## Error Handling And Rollback

- Request validation uses Zod.
- Application errors return stable machine-readable codes.
- Multi-step state changes use database transactions.
- Agent execution records are written before execution and finalized after success, timeout, or failure.

## Versioning Strategy

- API: `/api/v1`
- Schema migrations: timestamped folders under Prisma migrations
- Docker tags: `vX.Y.Z`, `sha-<gitsha>`, and `latest` for local examples only

## Maintainability And Extension Notes

- Prefer adding new Agent tools through the registry and external plugin loader instead of editing route code.
- Keep tenant-aware filters in service logic even if RLS is enabled, so isolation remains defense in depth.
- Add new API versions side by side instead of breaking `/api/v1`.
- Track technical debt in ADRs or issue labels such as `security`, `scalability`, and `migration`.
- The frontend docs center depends on repository Markdown being present at runtime, so deployment artifacts must preserve `docs/` and selected root Markdown files.
