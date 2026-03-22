# Changelog

This file records notable repository-level changes.

Recommended entry style:

- group changes by release
- prefer user-visible or operator-visible outcomes
- mention docs, deployment, and license changes when they affect how the repo is used

## Unreleased

- Improved root and `docs/` documentation to better match the current repository structure, local workflow, deployment path, and operational behavior.
- Expanded Chinese-first root documentation including `README.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `COMMERCIAL_LICENSE.md`.
- Added clearer contribution guidance, repository-map delivery notes, and more realistic configuration and validation instructions.
- Improved local developer configuration with better documented `.env.example`, richer root npm scripts, and healthier Docker Compose defaults.

## 0.2.0 - 2026-03-23

- Hardened auth middleware: JWT verification now confirms the user exists and is active in the database before granting access.
- Added HttpOnly cookie-based session management via a Next.js BFF layer; the frontend no longer stores backend tokens in localStorage.
- Moved provider API key storage server-side with AES-256-GCM encryption via `PROVIDER_CONFIG_SECRET`.
- Added provider base URL normalization and validation to prevent pointing chat at arbitrary upstream hosts.
- Made rate limiting fully configurable via environment variables (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`, `AGENT_RATE_LIMIT_WINDOW_MS`, `AGENT_RATE_LIMIT_MAX`).
- Added duration string parsing utility (`src/lib/duration.ts`) with Vitest coverage.
- Extracted dashboard, chat, and settings pages into focused, reusable components.
- Added custom React hooks for chat workspace, dashboard data, dashboard session, and provider settings state management.
- Added outbound request timeouts for upstream model provider API calls.
- Added Vitest configuration and initial frontend test suite.
- Updated `check.sh` to include the lint step alongside typecheck, test, and build.
- Updated `docker-compose.yml` to pass new environment variables to containers.
- Updated deployment and operations documentation in English and Chinese.

## 0.1.0 - 2026-03-21

- Added a bilingual multi-tenant auth starter with JWT and refresh-token flow.
- Added tenant-scoped user, tenant, audit, and Agent APIs.
- Added built-in Agent tool execution with registry and plugin loading contract.
- Added Prisma schema, seed data, and initial SQL migration.
- Added Docker Compose, Kubernetes, and Helm deployment drafts.
- Added bilingual documentation, license guide, repository map, and operations docs.
- Corrected the repository licensing position to PolyForm Noncommercial 1.0.0.
