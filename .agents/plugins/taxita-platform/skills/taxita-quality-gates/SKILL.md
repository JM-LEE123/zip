---
name: taxita-quality-gates
description: Create or review TaxiTa implementation checks, regression tests, acceptance evidence, security review notes, build validation, or release readiness. Use before merging or releasing changes that affect lifecycle state, privacy, points, matching, providers, or deployment configuration.
---

# TaxiTa quality gates

Read the relevant product skill and `docs/PRD.md` before choosing checks.

1. Map each changed behavior to a PRD requirement, authorization rule, lifecycle invariant, and failure mode.
2. Cover the happy path plus invalid state, unauthorized actor, provider failure, retry, and concurrency behavior where applicable.
3. For matching, verify evidence and explanation fields; for settlement, verify atomic writes and idempotency; for UI, verify mobile, keyboard, and private-data states.
4. Run `npm run lint` when ESLint is available and always report if the project lacks the configured lint executable. Run `npm run build` for production code or configuration changes.
5. Report evidence, untested risk, and any blocked prerequisite. Do not claim deployment, database, or provider verification that did not run.

