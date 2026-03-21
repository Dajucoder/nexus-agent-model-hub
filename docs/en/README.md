# Nexus Agent Model Hub Documentation

Nexus Agent Model Hub is a source-available reference repository for a multi-tenant login system with built-in Agent tool calling, a model encyclopedia frontend, bilingual UI, Docker deployment, and extensible plugin contracts.

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

## 2. Scheme A Decision Map

See [SCHEME_A_DECISIONS.md](./SCHEME_A_DECISIONS.md).

## 3. Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Repository Map

See [REPOSITORY_MAP.md](./REPOSITORY_MAP.md).

## 4. Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## 5. Operations

See [OPERATIONS.md](./OPERATIONS.md).

## 6. API

- OpenAPI draft: [`../api/openapi.yaml`](../api/openapi.yaml)
- Auth flow: register, login, refresh, logout, current user
- Tenant flow: current tenant, audit log list
- Agent flow: list tools, invoke tool, inspect run history

## 7. Database And Migrations

- Primary database: PostgreSQL 16
- ORM: Prisma
- Migration mode: versioned SQL in `packages/backend/prisma/migrations`
- Seed data: `packages/backend/prisma/seed.ts`
- Backup guidance: logical dump every 6 hours for small tenants, WAL shipping for production

## 8. Testing And Quality

- Unit tests: permission checks, token helpers, Agent registry logic
- Integration tests: auth routes, tenant isolation, Agent invocation
- E2E path: register or sign in, inspect tenant, invoke Agent
- CI gates: typecheck, build, tests

## 9. Localization

- UI strings live in `packages/frontend/messages`
- API error translation keys live in backend locale dictionaries
- Docs are maintained as parallel `docs/en` and `docs/zh` trees

## 10. License And Compliance

Read [LICENSE_GUIDE.md](./LICENSE_GUIDE.md) before deployment or redistribution.

Important clarification:

- The delivered default is **PolyForm Noncommercial 1.0.0**
- This license is source-available, not OSI open source
- Commercial SaaS, paid managed hosting, commercial internal use, and embedding in a commercial product require a separate license

The last bullet is an operational interpretation of the official noncommercial boundary, not legal advice.

## 11. Developer And Contributor Guide

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 12. Community Files

- Root contribution entry: [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
- Code of conduct: [`../../CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md)
- Security policy: [`../../SECURITY.md`](../../SECURITY.md)
- Changelog: [`../../CHANGELOG.md`](../../CHANGELOG.md)
- Commercial licensing notice: [`../../COMMERCIAL_LICENSE.md`](../../COMMERCIAL_LICENSE.md)

## 13. Merged Model Hub References

- Chinese master plan: [`../zh/MODEL_HUB_MASTER_PLAN.md`](../zh/MODEL_HUB_MASTER_PLAN.md)
- Chinese page spec: [`../zh/MODEL_HUB_PAGE_SPEC.md`](../zh/MODEL_HUB_PAGE_SPEC.md)
