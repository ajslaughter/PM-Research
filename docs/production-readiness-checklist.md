# PM Research Production Readiness Checklist (P0 / P1 / P2)

_Last updated: 2026-02-19_

This checklist is mapped directly to the current codebase and API surface.

## How to use this document

- **P0** = required before calling this "production-ready" for non-trivial user traffic.
- **P1** = high-value hardening after P0.
- **P2** = operational maturity and optimization.

Each item includes:
- **Why** it matters.
- **Mapped files/routes** in this repo.
- **Success criteria** (definition of done).

---

## P0 — Must-do before production

### P0.1 Replace in-memory rate limiting with shared, durable storage

**Why:** Current rate limits are in-memory and explicitly noted as unreliable on serverless.

**Mapped files/routes:**
- `src/lib/security.ts` (shared API rate-limit helper)
- `src/app/api/pmbot/route.ts` (custom PM Bot limits)
- Any API route consuming `checkRateLimit` from `src/lib/security.ts`

**Success criteria:**
- Rate limits enforced consistently across concurrent instances and cold starts.
- Limits survive redeploys and traffic bursts.
- 429 responses include stable retry/reset metadata.

---

### P0.2 Replace in-memory market data cache with external cache

**Why:** The `/api/prices` cache is in-memory with the same serverless reliability caveat.

**Mapped files/routes:**
- `src/app/api/prices/route.ts`

**Success criteria:**
- Cache hits are shared across instances.
- TTL behavior remains equivalent or better than current 30s behavior.
- Cache fallback path is tested for provider failures.

---

### P0.3 Enforce strict admin authorization in production

**Why:** Current fallback treats any authenticated user as admin when `ADMIN_EMAILS` is unset.

**Mapped files/routes:**
- `src/lib/security.ts` (`verifyAdminAuth`)
- `src/middleware.ts` (admin route gate at `/admin`)
- `src/app/admin/page.tsx`
- Admin APIs (e.g. generation/cleanup endpoints under `src/app/api/*`)

**Success criteria:**
- Production boot fails closed if admin allowlist/role config is missing.
- Only explicit admin identities can access admin APIs and admin UI paths.
- Unauthorized attempts are logged with request identifiers.

---

### P0.4 Add test coverage for critical auth and write paths

**Why:** There are currently no automated tests in repo scripts.

**Mapped files/routes:**
- `package.json` scripts (test command + CI integration)
- `src/app/api/auth/session/route.ts`
- `src/app/api/user-watchlists/route.ts`
- `src/lib/security.ts`
- `src/middleware.ts`

**Success criteria:**
- Automated tests exist for:
  - session cookie set/clear behavior,
  - unauthorized/authorized watchlist CRUD,
  - admin authorization paths,
  - rate-limit edge cases.
- CI fails on test failures.

---

### P0.5 Define and enforce CI quality gates

**Why:** Lint currently passes with warnings; no enforced pipeline quality bar is documented.

**Mapped files/routes:**
- `package.json`
- Vercel deployment flow (`vercel.json`, deployment pipeline)

**Success criteria:**
- PR checks must pass for lint, typecheck, tests, and build.
- Policy defined for warning budget (ideally zero for hooks/security rules).
- Broken main branch triggers rollback/hotfix protocol.

---

### P0.6 Add baseline observability and incident diagnostics

**Why:** Console logs alone are insufficient for production incident response.

**Mapped files/routes:**
- API handlers under `src/app/api/**/route.ts`
- `src/lib/security.ts`

**Success criteria:**
- Centralized error tracking is enabled for server/client.
- Request correlation IDs are included in API logs.
- Dashboard/alerts exist for 5xx rate, 429 rate, and external API failures (Anthropic, Alpaca, Yahoo fallback).

---

## P1 — Important hardening after P0

### P1.1 Tighten secret/config validation at startup

**Why:** Missing env vars are handled ad hoc in route handlers; startup validation reduces runtime surprises.

**Mapped files/routes:**
- `.env.example`
- `src/lib/supabase.ts`
- API routes using external providers (`/api/prices`, `/api/pmbot`, `/api/generate-article`, `/api/generate-article-gemini`)

**Success criteria:**
- Required envs validated once at startup/build.
- Configuration errors are explicit, with safe fallback only where intended.
- `.env.example` matches actual runtime requirements.

---

### P1.2 Add contract validation for external API payloads

**Why:** Provider responses can drift; unchecked JSON parsing can cause runtime breakage.

**Mapped files/routes:**
- `src/app/api/prices/route.ts`
- `src/app/api/pmbot/route.ts`
- `src/app/api/generate-article/route.ts`
- `src/app/api/generate-article-gemini/route.ts`
- `src/app/api/polygon/route.ts`

**Success criteria:**
- Response parsing uses explicit schema validation (or defensive guards) before access.
- Provider schema errors return controlled responses (no unhandled exceptions).
- Error metrics distinguish provider errors vs. app errors.

---

### P1.3 Security posture upgrades for auth/session handling

**Why:** Current cookie/session mechanism works but can be hardened further for enterprise expectations.

**Mapped files/routes:**
- `src/app/api/auth/session/route.ts`
- `src/middleware.ts`

**Success criteria:**
- Explicit token rotation/refresh strategy documented.
- Session invalidation semantics tested.
- CSRF posture documented for cookie-authenticated flows.

---

### P1.4 Performance budgets and API SLOs

**Why:** Build output shows large pages and many dynamic APIs; define measurable targets.

**Mapped files/routes:**
- High-load pages (`/watchlist`, `/research`, `/pm-live`, `/pmbot`)
- API endpoints (`/api/prices`, `/api/pmbot`, `/api/market-map`, `/api/live-feed`)

**Success criteria:**
- P95 latency targets documented and monitored.
- First-load JS and route-level budgets defined and tracked.
- Regression alerts configured for latency and payload size.

---

### P1.5 Data governance and backup/restore drills

**Why:** User-generated watchlists and research content need recoverability guarantees.

**Mapped files/routes:**
- `src/app/api/user-watchlists/route.ts`
- SQL policies/migrations in `sql/`

**Success criteria:**
- Backup cadence documented (RPO/RTO targets).
- Restore drill executed and time measured.
- Access audit trail for admin content operations.

---

## P2 — Maturity and scale

### P2.1 Canary/preview release strategy with rollback automation

**Why:** Safer releases reduce blast radius during rapid iteration.

**Mapped files/routes:**
- Vercel deployment setup (`DEPLOYMENT.md`, `vercel.json`)

**Success criteria:**
- Controlled rollout strategy documented.
- One-command rollback path verified in staging.
- Post-deploy smoke checks automated.

---

### P2.2 Cost and quota controls for AI/data providers

**Why:** External API costs can spike with growth.

**Mapped files/routes:**
- `/api/pmbot`
- `/api/generate-article`
- `/api/generate-article-gemini`
- `/api/prices`

**Success criteria:**
- Daily/monthly spend guardrails and alerts defined.
- Per-endpoint quota protection in place.
- Graceful degradation UX when quotas hit.

---

### P2.3 Compliance and policy automation

**Why:** Research + AI products benefit from repeatable policy enforcement.

**Mapped files/routes:**
- `/api/compliance-cleanup`
- `/api/cleanup-articles`
- Research/admin data flows

**Success criteria:**
- Automated policy checks run on newly generated content.
- Policy violations are blocked/quarantined with audit logging.
- Human review workflow defined for edge cases.

---

## Suggested execution order (fast path)

1. **Week 1:** P0.1, P0.2, P0.3
2. **Week 2:** P0.4, P0.5
3. **Week 3:** P0.6 + P1.1
4. **Week 4+:** Remaining P1 then P2

---

## Current readiness snapshot

- **Beta-ready:** yes (already deployable and functional)
- **Production-ready for scaled/reliability-sensitive usage:** not yet
- **Primary blockers:** distributed rate limiting/caching, strict admin auth defaults, test/CI coverage, and observability
