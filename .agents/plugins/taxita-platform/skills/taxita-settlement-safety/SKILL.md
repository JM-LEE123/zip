---
name: taxita-settlement-safety
description: Implement or review TaxiTa administrator-issued point deposits, final fare settlement, refunds, additional deductions, no-show handling, transaction idempotency, and audit trails. Use for any change that can affect a user's point balance or settlement outcome.
---

# TaxiTa settlement safety

Read `docs/PRD.md` and `../taxita-domain-engineering/references/domain-invariants.md` first. Treat this as a high-risk workflow.

1. Identify the authorized actor, confirmed settlement participants, estimated total, actual total, idempotency key, and expected ledger effects.
2. Calculate deposit as `ceil(estimated_total / participant_count)` and final share as `ceil(actual_total / settlement_participant_count)` only after validating positive integers and the applicable participant state.
3. Persist final settlement state, every point mutation, and audit metadata in one transaction. Enforce one completed settlement per trip and make retries return the existing result.
4. Model refund and additional-deduction entries explicitly; never mutate or delete historical ledger entries to hide a correction.
5. Verify normal, retry, concurrent request, no-show, insufficient-point, and administrator-authorization cases before handoff.

Do not add user top-up, cash-out, card payment, payment gateway, or real-money refund behavior to the MVP.

