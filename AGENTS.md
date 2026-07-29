# TaxiTa — Project Instructions

## Product and source of truth

- Build the TaxiTa MVP described in `docs/PRD.md`. It helps university students form a 2–4 person shared taxi group for the same or a permitted nearby destination.
- Treat the PRD as authoritative. Do not silently resolve its open questions or expand the MVP; surface decisions that require product, legal, provider, or operations approval.
- Keep changes scoped to the requested feature. Preserve existing user work and avoid unrelated refactors.

## Stack and conventions

- Use Next.js App Router, TypeScript, React 19, Tailwind CSS, and shadcn/ui.
- Prefer Server Components. Use Client Components only for browser APIs, local interaction, or imperative UI state.
- Implement privileged writes in route handlers or server actions. Validate at the server boundary; browser validation is UX only.
- Target Neon PostgreSQL for durable state. Keep database, map, routing, and AI integrations behind typed provider interfaces.
- Keep all credentials server-only. Do not expose `DATABASE_URL`, map-provider keys, AI keys, or raw provider responses to client code.
- Use Vercel Preview and Production as separate environments with separate Neon and provider credentials.

## MVP boundaries

- Require a completed profile before creating a group, applying to a group, or using point operations.
- The MVP may collect phone number, name, gender, and university email, but does not implement phone or university-email verification.
- Implement group creation with origin, destination, departure time, recruitment-close method, and a target capacity of 2–4.
- Do not implement taxi dispatch, card payment, payment gateways, user point purchase/top-up, cash-out, real-money refund, or automatic taxi-fare collection.
- Use administrator-issued points only. The system models deposits and settlement results; it does not move real money.
- Implement reports and blocks, and minimize contact, location, and personal-data exposure before a group is confirmed.

## State and authorization invariants

- Keep group states explicit: `DRAFT`, `OPEN`, `CLOSED`, `CONFIRMED`, `IN_PROGRESS`, `SETTLEMENT_PENDING`, `COMPLETED`, `CANCELLED`, `EXPIRED`.
- Keep participant states explicit: `APPLIED`, `APPROVED`, `DEPOSITED`, `CHECKED_IN`, `NO_SHOW`, `COMPLETED`, `CANCELLED`.
- Close recruitment at the departure time or when the host closes it. Reject new applications and approvals after closure.
- Confirm a group only when at least two eligible participants have completed the required confirmation/deposit flow. Expire it when the minimum is not met.
- Never let AI output automatically apply, approve, confirm, settle, or change a user’s state.
- Authorize every user, host, and administrator action on the server. Do not trust client-supplied identities, roles, balances, point amounts, or state transitions.

## Matching, maps, and AI

- Make matching explainable and evidence based. Score only eligible open groups from actual origin, destination, time, capacity, and permitted detour inputs.
- Store or return the matched group ID, normalized route calculation, time of calculation, score, and human-readable recommendation reason.
- Treat a nearby destination as an explicit detour policy. Keep thresholds configurable and do not invent route, price, distance, availability, or provider data.
- Use AI only to explain calculated matching evidence. Provide deterministic fallback behavior for provider failures, incomplete responses, and rate limits.

## Points and settlement

- Treat point ledger entries as append-only audit records. Include actor, reason, related trip, idempotency key, amount, and balance effect.
- Calculate per-person deposit as `ceil(estimated_total / confirmed_participant_count)` and final burden as `ceil(actual_total / settlement_participant_count)`.
- Use the confirmed settlement participant count for no-show handling unless the PRD is explicitly changed.
- Perform settlement state changes, point-ledger writes, and balance updates in one database transaction.
- Require idempotency for retryable deposits, deductions, refunds, and settlement requests. A retry must return the original completed result, not create a new ledger entry.
- Do not delete or mutate historical ledger rows to hide a correction; create an explicit compensating entry.

## UI and privacy

- Design mobile first. Every flow must include loading, empty, error, and disabled/closed states where relevant.
- Show destination, time, capacity, estimated share, and relevant policy before a participant confirms an irreversible action.
- Keep exact addresses, phone numbers, point balances, and settlement details visible only to authorized users at the correct lifecycle stage.
- Use semantic controls, keyboard support, visible focus, clear labels, and accessible error messages.

## Skill and agent routing

Use the installed `taxita-platform` skills for the matching and settlement domain.

| Work | Required skill |
| --- | --- |
| Trip groups, participants, reports, product policy | `$taxita-domain-engineering` |
| Route handlers, server actions, validation, authorization | `$taxita-api-and-auth` |
| Neon schema, migrations, transactions, audit data | `$taxita-neon-data` |
| Map/routing provider, fare estimate, detour, AI reason | `$taxita-matching-engine` |
| Deposits, ledger, no-shows, settlement, retries | `$taxita-settlement-safety` |
| Mobile UI, accessibility, responsive UX | `$taxita-mobile-ui`, `$vercel-react-best-practices`, `$web-design-guidelines` |
| Regression, acceptance, security, release evidence | `$taxita-quality-gates` |
| Vercel deployment readiness | `$taxita-release-readiness`, `$deploy-to-vercel` |

- Use `taxita-domain-engineer` for feature implementation.
- Use `taxita-settlement-reviewer` as a read-only reviewer for financial, privacy, state-machine, and authorization risks.
- Use `taxita-release-engineer` for build, environment, and Vercel Preview readiness.
- Keep one implementation owner per change. Delegate only independent review or investigation that materially lowers risk.

## Verification and release safety

- Add or update focused tests when changing state transitions, authorization, settlement, provider adapters, or calculations.
- Run `npm run lint` when ESLint is available. The current repository does not declare ESLint, so report that limitation rather than treating an unavailable command as a pass.
- Run `npm run build` after production code or configuration changes.
- Before a release, verify environment-variable names and presence without printing secret values.
- Prefer Vercel Preview deployments. Never link/create a Vercel project, change Vercel environment variables, push commits, deploy to Production, or run production data operations without explicit user approval.

## Code review rules

- Flag missing server-side authorization, unvalidated external input, client-trusted security data, secret leakage, and exposure of private location/contact data.
- Flag missing transaction or idempotency protection for point and settlement mutations.
- Flag any path that bypasses the group/participant state machine, group capacity, recruitment closure, or explicit user confirmation.
- Flag AI-generated facts that are not grounded in provider calculations or stored application data.
