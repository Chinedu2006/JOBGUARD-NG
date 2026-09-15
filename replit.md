# JOBGUARD NG

JOBGUARD NG helps Nigerian young people assess suspicious job, scholarship, grant, fellowship, and recruitment offers before sharing money or sensitive information.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/jobguard-ng/src/App.tsx` — responsive checker, results, report flow, and opportunity directory
- `artifacts/jobguard-ng/src/index.css` — JOBGUARD NG visual tokens, motion, and responsive utility styles
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `artifacts/api-server/src/lib/risk-engine.ts` — configurable, explainable risk rules and extraction
- `lib/db/src/schema/opportunities.ts` and `lib/db/src/schema/reports.ts` — persisted opportunity and report models

## Architecture decisions

- The first MVP uses deterministic weighted rules rather than an opaque AI verdict so each risk signal can be explained to a user.
- Opportunity data and private reports use the shared PostgreSQL database; seeded opportunity records are explicitly marked as demo or source-provided.
- Screenshot uploads intentionally fall back to manual text entry when OCR is unavailable instead of pretending to extract text.

## Product

- Users can paste a message or link, run a risk assessment, inspect signals and extracted details, submit a private suspicious-offer report, and browse/filter seeded opportunities.

## User preferences

None recorded.

## Gotchas

- The artifact workflow supplies `PORT` and `BASE_PATH`; use the managed workflow for the live preview.
- After changing the OpenAPI spec, run `pnpm --filter @workspace/api-spec run codegen`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
