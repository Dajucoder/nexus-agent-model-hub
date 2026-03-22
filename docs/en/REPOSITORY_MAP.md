# Repository Map

```text
<repo-root>/
├── .github/workflows/              # CI validation
├── content/                        # Model content assets and MDX
├── docker/                         # Backend and frontend Dockerfiles
├── docs/
│   ├── api/openapi.yaml            # OpenAPI draft
│   ├── assets/                     # README diagrams and preview images
│   ├── en/                         # English docs
│   ├── releases/                   # Release notes and release drafts
│   └── zh/                         # Chinese docs
├── helm/nexus-agent-model-hub/     # Helm chart draft
├── k8s/                            # Kubernetes manifests
├── packages/
│   ├── backend/
│   │   ├── prisma/                 # Schema, migrations, seed, RLS notes
│   │   ├── src/agents/             # Built-in tools and plugin loader
│   │   ├── src/api/                # Routes and middleware
│   │   ├── src/auth/               # JWT helpers
│   │   ├── src/lib/                # i18n, permissions, semaphore, duration parsing
│   │   ├── src/db/                 # Prisma client
│   │   └── tests/                  # Unit tests
│   └── frontend/
│       ├── app/                    # Next.js App Router pages
│       │   └── api/
│       │       ├── auth/           # BFF auth routes (login, register, logout via HttpOnly cookies)
│       │       ├── backend/        # Backend API proxy route
│       │       ├── chat/           # Chat API route
│       │       └── settings/       # Provider settings API route
│       ├── components/             # Platform and model hub UI
│       ├── lib/
│       │   ├── hooks/              # Custom React hooks (chat, dashboard, provider settings)
│       │   ├── server/             # Server-side helpers (auth-session, provider-security)
│       │   └── ...                 # API, session, and model catalog helpers
│       ├── messages/               # zh/en dictionaries
│       ├── tests/                  # Frontend Vitest tests
│       ├── vitest.config.ts        # Frontend test configuration
│       └── vitest.setup.ts         # Frontend test setup
├── .env.example                    # Environment template
├── LICENSE                         # PolyForm Noncommercial 1.0.0 text
├── NOTICE                          # Required notice line
├── CONTRIBUTING.md                 # Root contribution entry
├── CODE_OF_CONDUCT.md              # Community expectations
├── SECURITY.md                     # Private security reporting policy
├── CHANGELOG.md                    # Release history
├── COMMERCIAL_LICENSE.md           # Commercial-use notice
├── docker-compose.yml              # Minimum runnable local stack
└── README.md                       # Top-level guide
```

## Key Constraints

- All tenant data access must remain scoped by `tenantId`.
- New user-visible strings must be added to both `messages/en.json` and `messages/zh.json`.
- Plugin code should live outside the core runtime where possible and be loaded via `AGENT_PLUGIN_PATHS`.
- License wording in docs must remain consistent with `LICENSE` and `NOTICE`.

## Build And Delivery Notes

- `docker/Dockerfile.backend` builds the backend in multiple stages, generates Prisma client code, and runs `prisma migrate deploy` plus seed on container startup.
- `docker/Dockerfile.frontend` builds a standalone Next.js runtime and copies `docs/` plus selected root Markdown files so `/docs` works after deployment.
- `.github/workflows/ci.yml` currently validates the repository with `npm install`, `npm run db:generate`, `npm run typecheck`, `npm run build`, and `npm run test`.
- `docker-compose.yml` is the minimum local stack and now includes health checks for PostgreSQL, Redis, backend, and frontend.
