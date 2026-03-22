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

## 0.1.0 - 2026-03-21

- Added a bilingual multi-tenant auth starter with JWT and refresh-token flow.
- Added tenant-scoped user, tenant, audit, and Agent APIs.
- Added built-in Agent tool execution with registry and plugin loading contract.
- Added Prisma schema, seed data, and initial SQL migration.
- Added Docker Compose, Kubernetes, and Helm deployment drafts.
- Added bilingual documentation, license guide, repository map, and operations docs.
- Corrected the repository licensing position to PolyForm Noncommercial 1.0.0.
