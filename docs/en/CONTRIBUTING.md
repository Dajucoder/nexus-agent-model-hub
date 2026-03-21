# Contributing

## Before You Start

- Read `LICENSE`, `NOTICE`, and `docs/en/LICENSE_GUIDE.md`
- Contributions are accepted under the repository's PolyForm Noncommercial 1.0.0 terms unless a separate contributor agreement is introduced later

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

## Standards

- TypeScript for application code
- Flat API versioning with OpenAPI updates in the same pull request
- Tests required for auth, tenant isolation, and Agent execution changes
- Keep user-facing text in both English and Chinese

## Pull Request Checklist

- Build passes
- Tests pass
- Docs updated
- License implications reviewed
- No new cross-tenant access path introduced
