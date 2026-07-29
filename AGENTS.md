# TaxiTa working agreements

- Treat `docs/PRD.md` as the MVP source of truth. Preserve the 2–4 participant limit and the documented trip and participant state transitions.
- Build with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui. Prefer server-side validation and route handlers for privileged operations.
- Target Neon PostgreSQL for persistent data. Keep database access, map-provider access, and AI matching behind provider interfaces; do not expose provider secrets to the browser.
- MVP uses administrator-issued points only. Do not add card payments, user top-ups, cash withdrawal, or automated taxi dispatch unless the PRD changes.
- Make point-ledger and settlement writes transactional and idempotent. Keep an auditable reason, actor, and related trip for each point mutation.
- Do not deploy, link a Vercel project, change Vercel environment variables, or run production data operations without the user's explicit approval.
- Before handoff, run `npm run lint`; run `npm run build` when a change affects production code or configuration.

## Skill routing

Use the installed `taxita-platform` plugin skills before changing the matching or settlement product domain.

| Task | Skill |
| --- | --- |
| Trip, participant, report, or MVP policy | `$taxita-domain-engineering` |
| Route handler, server action, validation, or authorization | `$taxita-api-and-auth` |
| Neon schema, migration, query, transaction, or audit model | `$taxita-neon-data` |
| Map provider, fare estimate, detour score, or AI recommendation | `$taxita-matching-engine` |
| Deposit, point ledger, no-show, settlement, or retry safety | `$taxita-settlement-safety` |
| Mobile page, component, accessibility, or UX flow | `$taxita-mobile-ui` plus Vercel React and web-design skills |
| Test plan, regression review, release evidence, or acceptance check | `$taxita-quality-gates` |
| Vercel Preview or Production readiness | `$taxita-release-readiness` plus `$deploy-to-vercel` |

Use `taxita-domain-engineer` for implementation, `taxita-settlement-reviewer` for read-only risk review, and `taxita-release-engineer` for deployment readiness. Keep one owner for a change; delegate independent review only when it materially reduces risk.
