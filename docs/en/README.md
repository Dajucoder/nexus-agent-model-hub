# Nexus Agent Model Hub Documentation

Source-available multi-tenant authentication, Agent tool-calling, model encyclopedia, leaderboard, and chat demo platform with bilingual UI and docs.

**English** | [中文](../zh/README.md)

## About

Nexus Agent Model Hub is a source-available starter for teams that want strict tenant isolation, a reusable login system, built-in Agent tool execution, bilingual documentation, and deployment-ready infrastructure in one repository.

## Quick Preview

Representative UI preview for the public repository landing page.

![Quick preview of login, dashboard, model hub, and chat demo](../assets/quick-preview.svg)

## Architecture Overview

High-level platform layout covering frontend, backend, Agent runtime, storage, and operations.

![Architecture overview for frontend, backend, agent runtime, storage, and operations](../assets/architecture-overview.svg)

## 1. Project Goals And Constraints

- Deliver a reusable repository skeleton that teams can fork and adapt.
- Enforce tenant-aware access boundaries at the data model, API, and audit layers.
- Support concurrent multi-user login, refresh-token sessions, and optional TOTP.
- Expose an Agent execution capability that can be extended without modifying the core runtime.
- Merge the original model encyclopedia, comparison, leaderboard, settings, and chat demo into the same root project.
- Ship with Chinese and English UI plus documentation.
- Default to a **noncommercial source-available license** so usage boundaries are explicit.

Minimum acceptance thresholds:

- P95 API latency under 300 ms for authenticated CRUD endpoints on a single-node dev deployment
- P95 Agent dispatch overhead under 100 ms before tool execution starts
- No cross-tenant reads or writes through supported API paths
- Structured logs and health endpoints available in every environment
- Docker Compose startup for local development in under 5 minutes on a typical laptop

## 2. What This Repository Delivers

- Multi-tenant login system with strict tenant-aware API boundaries
- JWT access token plus refresh token authentication flow
- Tenant-scoped RBAC and audit logs
- Built-in Agent tool calling with plugin registration
- Integrated model encyclopedia, comparison, leaderboard, provider settings, and chat demo pages
- Chinese and English UI plus bilingual documentation
- Docker Compose, Kubernetes, and Helm deployment assets
- OpenAPI draft, Prisma schema, migrations, CI workflow, and contribution guide

## 3. Scheme A Decision Map

This repository follows the spirit of the provided Scheme A baseline and documents each decision in [SCHEME_A_DECISIONS.md](./SCHEME_A_DECISIONS.md).

Key choices:

- Database: PostgreSQL for production, SQLite only as a local developer fallback option
- Authentication: full user auth flow with JWT and refresh tokens, plus an Auth.js v5 integration path documented for Next.js clients
- Agent transport: SSE-friendly API contract, first release includes basic built-in tools
- Deployment: Docker self-hosted is the default deliverable, Vercel-style frontend hosting remains optional
- Localization: `zh-CN` and `en-US` in the delivered MVP

## 4. Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## 5. Repository Map

See [REPOSITORY_MAP.md](./REPOSITORY_MAP.md).

## 6. Quick Start

```bash
# Optional: copy for custom secrets or port overrides
cp .env.example .env
docker compose up --build
```

Then open:

- Web UI: `http://localhost:3000`
- API health: `http://localhost:4000/api/v1/health`
- OpenAPI draft: [`../api/openapi.yaml`](../api/openapi.yaml)
- Community files: [CONTRIBUTING](../../CONTRIBUTING.md), [CODE_OF_CONDUCT](../../CODE_OF_CONDUCT.md), [SECURITY](../../SECURITY.md), [CHANGELOG](../../CHANGELOG.md)

Default seeded account:

- Tenant: `demo`
- Email: `owner@demo.local`
- Password: `ChangeMe123!`

## 7. Minimum Demo Flow

1. Register a tenant owner or sign in with the seeded demo account.
2. Open the dashboard and inspect current tenant data.
3. Browse `/models`, `/leaderboard`, `/compare`, `/chat`, and `/settings`.
4. Call the built-in `echo` or `calculator` Agent from the dashboard API demo.
5. Review audit logs and Agent run history.

## 8. Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## 9. Operations

See [OPERATIONS.md](./OPERATIONS.md).

## 10. API

- OpenAPI draft: [`../api/openapi.yaml`](../api/openapi.yaml)
- Model card schema: [`../api/model-card.schema.json`](../api/model-card.schema.json)
- Auth flow: register, login, refresh, logout, current user
- Tenant flow: current tenant, audit log list
- Agent flow: list tools, invoke tool, inspect run history

## 11. Database And Migrations

- Primary database: PostgreSQL 16
- ORM: Prisma
- Migration mode: versioned SQL in `packages/backend/prisma/migrations`
- Seed data: `packages/backend/prisma/seed.ts`
- Backup guidance: logical dump every 6 hours for small tenants, WAL shipping for production

## 12. Testing And Quality

- Unit tests: permission checks, token helpers, Agent registry logic
- Integration tests: auth routes, tenant isolation, Agent invocation
- E2E path: register or sign in, inspect tenant, invoke Agent
- CI gates: typecheck, build, tests

## 13. Localization

- UI strings live in `packages/frontend/messages`
- API error translation keys live in backend locale dictionaries
- Docs are maintained as parallel `docs/en` and `docs/zh` trees

## 14. License And Compliance

Read [LICENSE_GUIDE.md](./LICENSE_GUIDE.md) before deployment or redistribution.

Important clarification:

- The delivered default is **PolyForm Noncommercial 1.0.0**
- This license is source-available, not OSI open source
- Commercial SaaS, paid managed hosting, commercial internal use, and embedding in a commercial product require a separate license

The last bullet is an operational interpretation of the official noncommercial boundary, not legal advice.

## 15. Developer And Contributor Guide

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 16. Community Files

- Root contribution entry: [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Code of conduct: [`../../CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md)
- Security policy: [`../../SECURITY.md`](../../SECURITY.md)
- Changelog: [`../../CHANGELOG.md`](../../CHANGELOG.md)
- Commercial licensing notice: [`../../COMMERCIAL_LICENSE.md`](../../COMMERCIAL_LICENSE.md)

## 17. Merged Model Hub References

- Chinese master plan: [`../zh/MODEL_HUB_MASTER_PLAN.md`](../zh/MODEL_HUB_MASTER_PLAN.md)
- Chinese page spec: [`../zh/MODEL_HUB_PAGE_SPEC.md`](../zh/MODEL_HUB_PAGE_SPEC.md)
