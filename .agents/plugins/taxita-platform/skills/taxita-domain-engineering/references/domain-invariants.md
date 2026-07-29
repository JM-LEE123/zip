# TaxiTa MVP invariants

## Group and participation

- A trip group has 2 to 4 confirmed participants. Fewer than 2 participants at close results in `EXPIRED`.
- New applications and approvals stop when recruitment closes; explicit participant actions remain required for joining and confirmation.
- Keep group states explicit: `DRAFT`, `OPEN`, `CLOSED`, `CONFIRMED`, `IN_PROGRESS`, `SETTLEMENT_PENDING`, `COMPLETED`, `CANCELLED`, `EXPIRED`.
- Keep participant states explicit: `APPLIED`, `APPROVED`, `DEPOSITED`, `CHECKED_IN`, `NO_SHOW`, `COMPLETED`, `CANCELLED`.

## Matching

- Score only open groups from actual origin, destination, departure-time, capacity, and detour inputs.
- Support same or permitted nearby destinations. Persist the group ID, distance calculations, reference time, and human-readable reason used for a recommendation.
- A recommendation never applies for, approves, or confirms a participant.

## Points and settlement

- MVP points are issued by an administrator; users cannot buy, top up, withdraw, or receive cash refunds through the product.
- The estimated per-person deposit is `ceil(estimated_total / confirmed_participant_count)`.
- The final per-person amount is `ceil(actual_total / settlement_participant_count)`.
- Use the confirmed settlement participant count for no-show handling unless a revised policy is approved.
- Record every point mutation with amount, balance impact, reason, actor, related trip, and an idempotency key. Persist settlement and all resulting ledger rows atomically.

## Safety and privacy

- Minimize phone, location, and contact disclosure until it is necessary for the confirmed group.
- Enforce reports, blocks, and privileged administrator point operations on the server.
- Keep map, database, and AI credentials in server-only environment variables and separate Preview from Production values.

