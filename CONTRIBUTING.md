# Contributing

Contribution guidance is available in both languages:

- English: [docs/en/CONTRIBUTING.md](./docs/en/CONTRIBUTING.md)
- 中文: [docs/zh/CONTRIBUTING.md](./docs/zh/CONTRIBUTING.md)

## Before you open a pull request

1. Read [LICENSE](./LICENSE), [NOTICE](./NOTICE), and [docs/en/LICENSE_GUIDE.md](./docs/en/LICENSE_GUIDE.md).
2. Make sure the change does not weaken tenant isolation, auth boundaries, or audit coverage.
3. Update both English and Chinese docs when user-facing behavior changes.
4. Run `npm run typecheck`, `npm run test`, and `npm run build`.

## Recommended local workflow

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:backend
npm run dev:frontend
```

## Contribution expectations

- Keep tenant-aware access boundaries explicit in backend changes.
- Preserve stable error shapes and avoid leaking secrets in logs or API responses.
- Update both `packages/frontend/messages/en.json` and `packages/frontend/messages/zh.json` when adding visible UI text.
- Update `docs/en` and `docs/zh` together when the behavior, setup flow, or operations model changes.
- Treat `/settings` as a local-development convenience, not as a production secrets design pattern.

## Validation expectations

- General changes: run `./scripts/check.sh`
- Backend-only changes: at minimum run `npm run typecheck --workspace=packages/backend` and `npm run test --workspace=packages/backend`
- Frontend-only changes: at minimum run `npm run typecheck --workspace=packages/frontend` and `npm run build --workspace=packages/frontend`
- CI currently runs: `npm install`, `npm run db:generate`, `npm run typecheck`, `npm run build`, `npm run test`

Helpful root shortcuts:

- `npm run bootstrap`
- `npm run check`
- `npm run typecheck:backend`
- `npm run typecheck:frontend`
- `npm run test:backend`
- `npm run build:frontend`
