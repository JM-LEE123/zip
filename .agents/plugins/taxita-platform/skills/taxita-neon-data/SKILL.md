---
name: taxita-neon-data
description: Design or review TaxiTa Neon PostgreSQL schemas, migrations, queries, indexes, transactions, audit records, or Preview and Production database configuration. Use for persistent-data work involving users, trip groups, participants, estimates, settlements, point ledgers, reports, or blocks.
---

# TaxiTa Neon data

Read `docs/PRD.md` and `../taxita-domain-engineering/references/domain-invariants.md` before altering persistent domain data.

1. Model a clear owner, primary key, timestamps, foreign keys, state columns, and constraints for each record.
2. Enforce 2–4 group capacity and valid lifecycle transitions in transactional server logic; use database constraints where they are stable and expressible.
3. Treat point ledgers as append-only audit data. Store actor, reason, related trip, idempotency key, amount, and balance effect.
4. Use a single transaction for settlement state, ledger writes, and derived balances. Design retried requests to return the original completed result.
5. Propose indexes from actual query paths, and use a migration plan that is reversible or has a documented recovery path.

Keep `DATABASE_URL` and other Neon credentials server-only, and do not mix Preview and Production databases.

