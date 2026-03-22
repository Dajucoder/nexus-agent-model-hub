# Nexus Agent Model Hub

[![CI](https://img.shields.io/github/actions/workflow/status/Dajucoder/nexus-agent-model-hub/ci.yml?branch=main&label=CI)](https://github.com/Dajucoder/nexus-agent-model-hub/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-orange)](./LICENSE)
[![Docs](https://img.shields.io/badge/docs-en%20%7C%20zh-blue)](./docs/en/README.md)
[![Node](https://img.shields.io/badge/node-20%2B-43853d)](https://nodejs.org/)

Source-available multi-tenant workspace for authentication, Agent operations, model discovery, ranking, and documentation with bilingual UI and docs.

Multi-tenant auth + Agent runtime + model hub in one root-level monorepo.
多租户认证、Agent 工具调用与模型展示平台的一体化根目录仓库。

**English** | [中文](./docs/zh/README.md)

## About

Nexus Agent Model Hub is a source-available starter for teams that want strict tenant isolation, a reusable login system, built-in Agent tool execution, bilingual documentation, and deployment-ready infrastructure in one repository.

Nexus Agent Model Hub 适合希望同时获得严格租户隔离、可复用登录系统、内置 Agent 工具调用、双语文档以及可部署基础设施的团队与开发者。

## Quick Preview

Representative UI preview for the public repository landing page.
仓库首页用的界面预览示意图。

![Quick preview of login, dashboard, model hub, and chat workspace](./docs/assets/quick-preview.svg)

## Architecture Overview

High-level platform layout covering frontend, backend, Agent runtime, storage, and operations.
覆盖前端、后端、Agent 运行时、数据存储与运维层的高层架构示意图。

![Architecture overview for frontend, backend, agent runtime, storage, and operations](./docs/assets/architecture-overview.svg)

## License Notice

This repository uses **PolyForm Noncommercial 1.0.0**.

- Personal study, research, testing, education, and noncommercial organizational use are allowed.
- Commercial use, paid hosting, managed cloud service, embedding into a commercial product, and use in revenue-generating operations are **not permitted without a separate commercial license**.
- This is **not an OSI-approved open source license**. It is a source-available noncommercial license.

Read [LICENSE](./LICENSE), [NOTICE](./NOTICE), and [docs/en/LICENSE_GUIDE.md](./docs/en/LICENSE_GUIDE.md) before use.

Official license source: https://polyformproject.org/licenses/noncommercial/1.0.0/

## What This Repository Delivers

- Multi-tenant login system with strict tenant-aware API boundaries
- JWT access token plus refresh token authentication flow
- Tenant-scoped RBAC and audit logs
- Built-in Agent tool calling with plugin registration
- Integrated model encyclopedia, comparison, leaderboard, provider settings, and chat workspace pages
- Chinese and English UI plus bilingual documentation
- Docker Compose, Kubernetes, and Helm deployment assets
- OpenAPI draft, Prisma schema, migrations, CI workflow, and contribution guide

## Scheme A Decision Baseline

This repository follows the spirit of the provided Scheme A baseline and documents each decision in [docs/en/SCHEME_A_DECISIONS.md](./docs/en/SCHEME_A_DECISIONS.md).

Key choices:

- Database: PostgreSQL for production, SQLite only as a local developer fallback option
- Authentication: full user auth flow with JWT and refresh tokens, plus an Auth.js v5 integration path documented for Next.js clients
- Agent transport: SSE-friendly API contract, first release includes basic built-in tools
- Deployment: Docker self-hosted is the default deliverable, Vercel-style frontend hosting remains optional
- Localization: `zh-CN` and `en-US` in the delivered MVP

## Repository Layout

```text
<repo-root>/
├── .github/workflows/        # CI
├── content/                  # Model content and MDX assets
├── docker/                   # Dockerfiles
├── docs/                     # English + Chinese docs + OpenAPI
├── helm/nexus-agent-model-hub/ # Helm chart draft
├── k8s/                      # Raw Kubernetes manifests
├── packages/
│   ├── backend/              # Express + Prisma API
│   └── frontend/             # Next.js merged UI (platform + model hub)
├── LICENSE
├── NOTICE
└── docker-compose.yml
```

## Quick Start

```bash
# Optional: copy for custom secrets or port overrides
cp .env.example .env
docker compose up --build
```

Then open:

- Web UI: `http://localhost:3000`
- Documentation center: `http://localhost:3000/docs`
- API health: `http://localhost:4000/api/v1/health`
- Platform summary: `http://localhost:4000/api/v1/platform/summary`
- OpenAPI draft: [`docs/api/openapi.yaml`](./docs/api/openapi.yaml)
- Community files: [CONTRIBUTING](./CONTRIBUTING.md), [CODE_OF_CONDUCT](./CODE_OF_CONDUCT.md), [SECURITY](./SECURITY.md), [CHANGELOG](./CHANGELOG.md)

Default bootstrap account:

- Tenant: `primary`
- Email: `owner@primary.local`
- Password: `ChangeMe123!`

## Minimum Product Validation Flow

1. Register a tenant owner or sign in with the seeded bootstrap account.
2. Open the dashboard and inspect current tenant data.
3. Browse `/models`, `/leaderboard`, `/compare`, `/chat`, and `/settings`.
4. Call the built-in `echo` or `calculator` Agent from the dashboard operation console.
5. Review audit logs and Agent run history.

## Configuration Notes

- `CORS_ORIGIN` now supports comma-separated origins, which is useful for preview environments and split frontend deployments.
- `NEXT_PUBLIC_API_URL` should point to the public backend base path, for example `https://api.example.com/api/v1`.
- The browser experience still uses a local-storage bootstrap session for convenience; production browser deployments should switch to HTTP-only cookies or a BFF.
- The in-app provider settings page now persists local development configuration to disk, but it still does not replace a production secret manager.

## Documentation

- In-app docs center: start the frontend and open `/docs` to browse the repository Markdown with bilingual navigation and full-page rendering
- [English overview](./docs/en/README.md)
- [Chinese overview](./docs/zh/README.md)
- [Product readiness](./docs/en/PRODUCT_READYNESS.md)
- [Architecture](./docs/en/ARCHITECTURE.md)
- [Deployment guide](./docs/en/DEPLOYMENT.md)
- [Operations guide](./docs/en/OPERATIONS.md)
- [Contribution guide](./docs/en/CONTRIBUTING.md)
- [License guide](./docs/en/LICENSE_GUIDE.md)
- [Release notes](./docs/releases/v0.1.0.md)
- [Examples](./examples/README.md)
- [Model hub plan (ZH)](./docs/zh/MODEL_HUB_MASTER_PLAN.md)
- [Model hub page spec (ZH)](./docs/zh/MODEL_HUB_PAGE_SPEC.md)

## Repository Community Files

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [SECURITY.md](./SECURITY.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md)

## Important Compliance Clarification

The earlier AGPL wording that sometimes appears in rough drafts is incorrect for noncommercial restrictions. AGPL does **not** by itself prohibit commercial use. This repository has been normalized to PolyForm Noncommercial 1.0.0 so that code, documentation, and operational guidance all use the same licensing boundary.
