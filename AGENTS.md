# AGENTS.md

This file is for coding agents working in `nexus-agent-model-hub`.
It captures the repository's practical workflow, command surface, and code conventions.

## Scope

- Monorepo managed with npm workspaces.
- Main packages:
  - `packages/backend`: Express + Prisma + Vitest + TypeScript.
  - `packages/frontend`: Next.js App Router + TypeScript.
- Node version in CI: Node 20.
- Package manager: `npm@10.9.2`.
- License is source-available and noncommercial; do not add guidance that conflicts with `LICENSE`, `NOTICE`, or `docs/en/LICENSE_GUIDE.md`.

## Rules Files

- No `.cursor/rules/` directory was found.
- No `.cursorrules` file was found.
- No `.github/copilot-instructions.md` file was found.
- If any of those files are added later, treat them as higher-priority repo instructions and merge them into future updates to this file.

## Repository Priorities

- Preserve tenant isolation and auth boundaries.
- Avoid introducing cross-tenant access paths.
- Keep audit coverage intact for security-sensitive flows.
- Update docs when user-facing behavior changes.
- Keep English and Chinese user-facing copy aligned when modifying visible text or docs.

## Setup And Daily Commands

Run from repo root unless noted otherwise.

## Install

```bash
npm install
```

## Local Environment

```bash
cp .env.example .env
docker compose up -d postgres redis
npm run db:generate
npm run db:migrate
npm run db:seed
```

Notes:

- Full stack via Docker: `docker compose up --build`
- Stop Docker stack: `docker compose down`
- Backend default port: `4000`
- Frontend default port: `3000`

## Development Commands

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
```

What they do:

- `npm run dev`: runs workspace dev scripts where present.
- `npm run dev:backend`: starts backend in watch mode with `tsx watch src/index.ts`.
- `npm run dev:frontend`: starts Next dev server on port 3000.

## Validation Commands

Root-level:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
./scripts/check.sh
```

Behavior:

- `lint` is effectively TypeScript-only validation in both packages.
- `typecheck` is also TypeScript-only validation.
- `test` runs backend Vitest tests and a placeholder frontend test script.
- `build` builds all workspaces with a build script.
- `./scripts/check.sh` runs `typecheck`, `test`, and `build` in that order.

CI currently runs:

```bash
npm install
npm run db:generate
npm run typecheck
npm run build
npm run test
```

## Package-Specific Commands

Backend:

```bash
npm run dev --workspace=packages/backend
npm run build --workspace=packages/backend
npm run lint --workspace=packages/backend
npm run typecheck --workspace=packages/backend
npm run test --workspace=packages/backend
npm run db:generate --workspace=packages/backend
npm run db:migrate --workspace=packages/backend
npm run db:seed --workspace=packages/backend
```

Frontend:

```bash
npm run dev --workspace=packages/frontend
npm run build --workspace=packages/frontend
npm run lint --workspace=packages/frontend
npm run typecheck --workspace=packages/frontend
npm run test --workspace=packages/frontend
```

## Running A Single Test

Backend tests use Vitest.

Run one test file:

```bash
npm run test --workspace=packages/backend -- tests/permissions.test.ts
```

Run one test by name:

```bash
npm run test --workspace=packages/backend -- -t "grants owner wildcard permission"
```

Run one file directly from the package:

```bash
npx vitest run packages/backend/tests/calculator-agent.test.ts
```

Frontend does not currently have a real test runner wired in; its `test` script prints a placeholder message.

## Formatting And Editor Defaults

- `.editorconfig` defines UTF-8, LF line endings, final newline, spaces, and 2-space indentation.
- Markdown keeps trailing whitespace when needed; other files trim trailing whitespace.
- Root formatter is Prettier:

```bash
npm run format
```

- Format only touches `packages/**/*.{ts,tsx,js,jsx,json,md,yml,yaml}`.

## TypeScript Standards

- TypeScript is strict in both packages.
- Backend also enables `noUncheckedIndexedAccess`.
- Prefer explicit domain types and narrow unions over loose `any`.
- Use `interface` for shaped object contracts already shared across models and API payloads.
- Use `type` aliases for unions, literal variants, or imported type-only composition.
- Use `import type` where only types are needed.
- Keep functions and route handlers typed enough that return shapes stay obvious.
- Do not weaken compiler settings to make a change pass.

## Import Conventions

- Group imports with framework/external modules first, then internal modules.
- Keep relative imports concise and consistent with nearby files.
- Use `node:` specifiers for Node built-ins in modern files.
- Put `import type` lines near related imports, not in a separate distant block.
- Avoid unused imports; this codebase is generally clean and minimal.

## Naming Conventions

- Use `camelCase` for variables, functions, and non-component helpers.
- Use `PascalCase` for React components, classes, interfaces, and error types.
- Use `UPPER_SNAKE_CASE` only for true constants or enum-style values when warranted.
- Prefer descriptive names over abbreviations unless the abbreviation is domain-standard.
- Match existing route naming like `authRouter`, `usersRouter`, `platformRouter`.
- Match existing helper naming like `createApp`, `loadSession`, `saveProviderConfig`, `errorHandler`.

## Backend Style

- Prefer small route modules under `packages/backend/src/api/routes/`.
- Validate request payloads with Zod close to the boundary.
- Throw `AppError` for expected business errors; let the shared error middleware format the response.
- Log unexpected failures with `logger`; do not expose sensitive internals in API responses.
- Keep JSON error shapes consistent: `error`, `message`, and optional `details`.
- Use Prisma queries and transactions directly, with readable variable names and minimal nesting.
- Preserve auth, rate limiting, request context, and audit-log behavior when changing secured flows.
- Keep secrets redacted from logs and avoid adding new log fields that leak credentials or tokens.

## Frontend Style

- Use Next.js App Router conventions already present in `packages/frontend/app/`.
- Default to server components; add `'use client'` only when hooks, browser APIs, or interactive state are required.
- Keep components focused and move reusable data helpers into `packages/frontend/lib/`.
- Use typed state and payload shapes rather than implicit object mutation.
- Follow existing simple fetch wrappers in `packages/frontend/lib/api.ts`.
- Prefer clear fallback messages and stable empty states over silent failure.
- Preserve bilingual UX patterns when editing visible copy.

## Error Handling Expectations

- Fail fast on invalid input at the boundary.
- Prefer structured errors over ad hoc string throwing in backend code.
- In frontend code, catch network/runtime errors where user feedback is needed and surface readable messages.
- When swallowing an error intentionally, make sure the fallback behavior is explicit and safe.
- Do not hide infra or auth failures behind misleading success states.

## Testing Expectations

- Add or update tests for auth, tenant isolation, permissions, and Agent execution changes.
- For backend logic, place tests under `packages/backend/tests/` using Vitest.
- Keep test names descriptive and behavior-focused.
- If frontend behavior changes materially and no automated test exists, note the gap in your final handoff.

## Documentation Expectations

- Update English and Chinese docs for user-visible or operational changes.
- Keep deployment, operations, and contribution guidance in sync with code changes.
- If you change commands, ports, env vars, or setup flow, update the corresponding docs in the same change.

## Agent Workflow Tips

- Start by reading package-level `package.json`, relevant `tsconfig` files, and nearby code before editing.
- Prefer the smallest consistent change over broad refactors.
- Validate with targeted commands first, then broader repo checks when needed.
- If touching backend-only code, at minimum run backend typecheck/tests.
- If touching frontend-only code, at minimum run frontend typecheck/build when practical.
- Before finishing, consider whether docs, bilingual copy, and security boundaries also need updates.
