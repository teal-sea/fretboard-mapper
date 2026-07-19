# Monetization and the API

**Additive, never load-bearing** ([[The Golden Rules]] #4): the core tool
works fully, free, unauthenticated with none of this configured. Stack:
Clerk (auth) · Polar (payments, $5/mo) · Neon (Postgres, `db/schema.sql`:
one `user_data` row per `clerk_user_id`, JSONB `app_state`). Secrets live
ONLY in `api/` env vars — see `.env.example`.

## The four endpoints (`api/`)
| Endpoint | Does | Auth |
|---|---|---|
| `checkout.ts` | Creates a Polar checkout session | Clerk JWT verified server-side; `externalCustomerId = claims.sub` — unforgeable |
| `portal.ts` | Polar customer portal (manage/cancel) | Same pattern |
| `sync.ts` | GET/POST the synced AppState subset | JWT + server-side `subscribed` re-check via Clerk |
| `webhook/polar.ts` | Flips the paid flag | Polar signature on **raw bytes** (`bodyParser:false` + SDK `validateEvent`) |

`authHelper.ts` (Bearer extraction) and `webhook/deriveSubscriptionUpdate.ts`
(event → flag mapping; `subscription.updated` deliberately ignored) are the
two tested files.

## The one rule that matters most
**`webhook/polar.ts` is the ONLY writer of Clerk `publicMetadata.subscribed`.**
Everything else reads it. The client can never claim it. Grep-verified
2026-07-19: exactly one `updateUserMetadata` write in the repo.

## Security posture (audit 2026-07-19 — all verified with file:line)
Not exploitable: token forgery, customer-id forgery, SQL injection (Neon
tagged templates = bound params), webhook bypass, client faking subscribed,
secret leakage into responses/logs, committed secrets (only `.env.example`
tracked). CORS deliberately absent (same-origin SPA) — do NOT add wildcard.

Hardened same day: sync POST whitelisted to `SYNCED_KEYS` + array-rejected +
32 KB cap; pull re-whitelisted client-side; Clerk/Neon outages → clean 503s.

Accepted gaps: no rate limiting (auth+subscriber-gated, hobby scale), no
webhook replay/idempotency store (flag is derived, not incremented — the
out-of-order window is tolerable), `verifyToken` without `authorizedParties`
(single Clerk instance). Untested endpoints: see [[Testing Tooling and CI]].

## Client side
`AccountMenu` owns the sync effect and the upgrade CTA (details in
[[App.tsx and Components]]); `?upgraded=1` → celebration veil + a Clerk-poll
until the webhook lands. Synced subset + both whitelist helpers:
`utils/cloudSync.ts` ([[AppState and Persistence]]).
