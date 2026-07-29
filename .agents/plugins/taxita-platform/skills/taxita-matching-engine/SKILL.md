---
name: taxita-matching-engine
description: Implement or review TaxiTa map-provider adapters, route and fare estimates, nearby-destination detour checks, ranking, AI recommendation explanations, or matching telemetry. Use whenever a feature calculates or presents a TaxiTa trip-match recommendation.
---

# TaxiTa matching engine

Read `docs/PRD.md` and `../taxita-domain-engineering/references/domain-invariants.md` before changing matching behavior.

1. Keep map and routing providers behind a typed adapter that returns normalized distance, duration, fare estimate, provider metadata, and retrieval time.
2. Score only eligible open groups using actual origin, destination, departure-time, capacity, and permitted-detour results. Make thresholds configurable rather than hiding them in UI code.
3. Persist or return the group ID, route calculation inputs, calculated deltas, score, and a human-readable reason for every recommendation.
4. Use AI only to summarize supported calculated facts. Never fabricate a route, price, distance, or availability; never allow AI output to join or approve a participant.
5. Provide deterministic fallback behavior when the map or AI provider is unavailable, rate-limited, or returns incomplete data.

