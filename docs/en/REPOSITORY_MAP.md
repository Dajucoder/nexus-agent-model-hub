# Repository Map

```text
<repo-root>/
├── .github/workflows/              # CI validation
├── content/                        # Model content assets and MDX
├── docker/                         # Backend and frontend Dockerfiles
├── docs/
│   ├── api/openapi.yaml            # OpenAPI draft
│   ├── en/                         # English docs
│   └── zh/                         # Chinese docs
├── helm/nexus-agent-model-hub/     # Helm chart draft
├── k8s/                            # Kubernetes manifests
├── packages/
│   ├── backend/
│   │   ├── prisma/                 # Schema, migrations, seed, RLS notes
│   │   ├── src/agents/             # Built-in tools and plugin loader
│   │   ├── src/api/                # Routes and middleware
│   │   ├── src/auth/               # JWT helpers
│   │   ├── src/lib/                # i18n, permissions, semaphore
│   │   ├── src/db/                 # Prisma client
│   │   └── tests/                  # Unit tests
│   └── frontend/
│       ├── app/                    # Next.js App Router pages
│       ├── components/             # Platform and model hub UI
│       ├── lib/                    # API, session, and model catalog helpers
│       └── messages/               # zh/en dictionaries
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
