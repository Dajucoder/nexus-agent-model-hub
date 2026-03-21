# Scheme A Decisions

This repository is based on the provided Scheme A direction, but a few points are intentionally overridden to satisfy the delivery requirements.

## Adopted From Scheme A

- `Database`: PostgreSQL is the primary production database.
- `Authentication system`: full login system, not API-key-only storage.
- `Agent conversation transport`: SSE-friendly backend contract is preserved.
- `Content and documentation`: Git-managed Markdown files remain the primary content source.
- `Model vendor expansion`: the Agent layer is provider-agnostic and can later connect to OpenAI, Anthropic, Google, DeepSeek, Mistral, and Meta.

## Required Overrides

- `Deployment target`: Docker self-hosting is the default operational target because the prompt requires Docker and multi-OS deployment. Vercel remains optional for the frontend only.
- `Internationalization`: the delivered MVP includes `zh-CN` and `en-US` only, because those are the required languages.
- `Agent tool calling`: Scheme A row 10 says tool calling is deferred. This repository upgrades that point to a first-release basic tool set because built-in Agent tools are an explicit hard requirement.

## Why This Variant Was Chosen

- It preserves Scheme A's full-stack posture and extensibility.
- It avoids vendor lock-in for authentication and infrastructure.
- It keeps a clear rollback path.

## Rollback And Switch Strategy

- To downgrade Agent tooling, disable built-in tools in the registry and remove the `/agents/call` route from the frontend.
- To move from Docker self-hosted to frontend-on-Vercel, keep the API in a container platform and point `NEXT_PUBLIC_API_URL` at the public API gateway.
- To replace the custom JWT bridge with Auth.js v5 end-to-end sessions, add an Auth.js adapter on the frontend and keep the API as a resource server using opaque or JWT access tokens.
