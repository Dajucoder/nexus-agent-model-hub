# Contributing

Contribution guidance is available in both languages:

- English: [docs/en/CONTRIBUTING.md](./docs/en/CONTRIBUTING.md)
- 中文: [docs/zh/CONTRIBUTING.md](./docs/zh/CONTRIBUTING.md)

Before opening a pull request:

1. Read [LICENSE](./LICENSE), [NOTICE](./NOTICE), and [docs/en/LICENSE_GUIDE.md](./docs/en/LICENSE_GUIDE.md).
2. Make sure the change does not weaken tenant isolation, auth boundaries, or audit coverage.
3. Update both English and Chinese docs when user-facing behavior changes.
4. Run `npm run typecheck`, `npm run test`, and `npm run build`.
