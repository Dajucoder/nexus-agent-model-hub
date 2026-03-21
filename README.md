# Nexus Agent Model Hub

Source-available multi-tenant authentication, Agent tool-calling, model encyclopedia, leaderboard, and chat demo platform with bilingual UI and docs.

**English** | [中文](./docs/zh/README.md)

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
- Integrated model encyclopedia, comparison, leaderboard, provider settings, and chat demo pages
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
- API health: `http://localhost:4000/api/v1/health`
- OpenAPI draft: [`docs/api/openapi.yaml`](./docs/api/openapi.yaml)
- Community files: [CONTRIBUTING](./CONTRIBUTING.md), [CODE_OF_CONDUCT](./CODE_OF_CONDUCT.md), [SECURITY](./SECURITY.md), [CHANGELOG](./CHANGELOG.md)

Default seeded account:

- Tenant: `demo`
- Email: `owner@demo.local`
- Password: `ChangeMe123!`

## Minimum Demo Flow

1. Register a tenant owner or sign in with the seeded demo account.
2. Open the dashboard and inspect current tenant data.
3. Browse `/models`, `/leaderboard`, `/compare`, `/chat`, and `/settings`.
4. Call the built-in `echo` or `calculator` Agent from the dashboard API demo.
5. Review audit logs and Agent run history.

## Documentation

- [English overview](./docs/en/README.md)
- [Chinese overview](./docs/zh/README.md)
- [Architecture](./docs/en/ARCHITECTURE.md)
- [Deployment guide](./docs/en/DEPLOYMENT.md)
- [Operations guide](./docs/en/OPERATIONS.md)
- [Contribution guide](./docs/en/CONTRIBUTING.md)
- [License guide](./docs/en/LICENSE_GUIDE.md)
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
