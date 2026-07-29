---
name: taxita-domain-engineering
description: Implement or review TaxiTa MVP features involving trip-group matching, participant lifecycle, administrator-issued point deposits, final settlement, Neon PostgreSQL, map providers, or AI recommendations. Use whenever a task must preserve the TaxiTa PRD's domain and safety invariants.
---

# TaxiTa domain engineering

Read `docs/PRD.md` and `references/domain-invariants.md` before changing domain behavior.

1. Identify the affected trip and participant states, actor permissions, and the source of truth for each field.
2. Keep client code for interaction only. Validate authorization, state transitions, numeric amounts, and limits in server code.
3. Isolate route, map, and AI integrations behind provider interfaces. Form recommendation reasons only from stored inputs and calculated results.
4. Write settlement and point-ledger mutations in one database transaction. Require an idempotency key for retryable mutations and retain an audit record.
5. Add focused tests or validation coverage for changed invariants. Run lint, then build when production behavior changes.

Do not implement real payment, user point purchase, cash-out, automatic taxi dispatch, or automatic participant joining for the MVP.

