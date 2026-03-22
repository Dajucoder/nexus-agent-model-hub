# Contributing

## Before You Start

- Read `LICENSE`, `NOTICE`, and `docs/en/LICENSE_GUIDE.md`
- Contributions are accepted under the repository's PolyForm Noncommercial 1.0.0 terms unless a separate contributor agreement is introduced later
- If your change affects visible behavior, plan to update both `docs/en` and `docs/zh`

## Development Workflow

```bash
npm install
# Optional: copy for custom secrets or port overrides
cp .env.example .env
docker compose up -d postgres redis
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:backend
npm run dev:frontend
```

Fast bootstrap helper:

```bash
./scripts/bootstrap.sh
```

That helper installs dependencies, generates Prisma client code, and prints the next migration and startup steps.

## Standards

- TypeScript for application code
- Flat API versioning with OpenAPI updates in the same pull request
- Tests required for auth, tenant isolation, and Agent execution changes
- Keep user-facing text in both English and Chinese
- Do not weaken tenant scoping, audit coverage, or auth middleware behavior to make a feature easier to ship
- Treat local file-backed provider settings as a developer convenience, not as a production secret-management pattern

## Validation

Preferred full validation:

```bash
./scripts/check.sh
```

Useful focused validation:

```bash
npm run typecheck --workspace=packages/backend
npm run test --workspace=packages/backend
npm run typecheck --workspace=packages/frontend
npm run build --workspace=packages/frontend
```

CI currently runs:

```bash
npm install
npm run db:generate
npm run typecheck
npm run build
npm run test
```

## Documentation Requirements

- Update both English and Chinese docs when setup steps, commands, env vars, ports, or user-visible behavior change
- Keep the root `README.md` aligned with the deeper docs under `docs/`
- If a frontend behavior changes materially and no automated frontend test exists, document the gap in your PR notes or handoff

## Pull Request Checklist

- Build passes
- Tests pass
- Docs updated
- License implications reviewed
- No new cross-tenant access path introduced
- Any new environment variable is documented in `.env.example` and the deployment docs when relevant
