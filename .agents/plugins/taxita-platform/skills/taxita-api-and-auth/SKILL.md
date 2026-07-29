---
name: taxita-api-and-auth
description: Design, implement, or review TaxiTa Next.js route handlers, server actions, input validation, authorization, user profile gates, reports, blocks, or privileged administrator operations. Use for any server boundary that changes TaxiTa data or reveals private information.
---

# TaxiTa API and authorization

Read `docs/PRD.md` and `../taxita-domain-engineering/references/domain-invariants.md` when the endpoint changes domain behavior.

1. Define the actor, required state, allowed transition, validated input, and response contract before writing the handler.
2. Authenticate and authorize on the server. Never accept a client-supplied user ID, administrator role, amount, balance, or lifecycle state as trusted.
3. Validate external input at the boundary, return stable errors, and avoid exposing phone, precise location, provider secrets, or internal audit data.
4. Require an idempotency key for retried point and settlement mutations. Use a transaction when a request changes multiple persisted records.
5. Add a focused success, unauthorized, and invalid-state test or documented verification case.

