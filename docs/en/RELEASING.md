# Releasing Guide

Use this checklist whenever you cut a repository release such as `v0.2.0`.

## 1. Pick The Version

- Use semantic versioning for the repository, backend workspace, frontend workspace, Helm chart, and docs.
- Create the release notes file at `docs/releases/vX.Y.Z.md`.
- Add or finalize the matching section in `CHANGELOG.md`.

## 2. Sync Version Metadata

Update all version touchpoints in the same change:

- `package.json`
- `packages/backend/package.json`
- `packages/frontend/package.json`
- `package-lock.json`
- `.env.example`
- `docker-compose.yml`
- `helm/nexus-agent-model-hub/Chart.yaml`
- `packages/backend/src/config/index.ts`
- `docs/api/openapi.yaml`
- any UI fallbacks or hard-coded runtime identifiers that show the product version

## 3. Review Release-Facing Docs

- Update `README.md` and `docs/en/README.md` plus `docs/zh/README.md` when the latest release link, setup steps, or user-visible behavior changed.
- Keep English and Chinese operational docs aligned when env vars, auth behavior, deployment defaults, or release steps change.
- If the release changes visible copy or workflows, confirm both language tracks remain consistent.

## 4. Validate Before Tagging

Run from the repository root:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Recommended manual checks:

- sign in with the seeded account or a staging tenant owner
- refresh the browser to confirm the cookie-backed session survives
- log out to confirm session cleanup
- open `/docs`, `/settings`, `/chat`, and `/dashboard`
- verify `/api/v1/health` and `/api/v1/platform/summary`
- run one successful Agent call and one expected validation failure

## 5. Commit, Tag, And Publish

After validation:

```bash
git add .
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin main --follow-tags
```

Then publish the Git hosting release entry using the contents of `docs/releases/vX.Y.Z.md`.
