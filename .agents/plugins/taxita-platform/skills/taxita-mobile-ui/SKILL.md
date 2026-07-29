---
name: taxita-mobile-ui
description: Build or review TaxiTa's mobile-first Next.js UI flows for signup, trip creation, matching, participation, deposit, chat entry, settlement, reports, blocks, and notifications. Use for TaxiTa page, component, UX, accessibility, responsive, or shadcn/ui work.
---

# TaxiTa mobile UI

Use `vercel-react-best-practices` and `web-design-guidelines` alongside this skill. Read `docs/PRD.md` for the affected user flow.

1. Preserve the PRD flow and make state, cost, deadline, and irreversible actions visible before confirmation.
2. Design for narrow screens first; use semantic controls, keyboard access, visible focus, descriptive errors, and loading/empty/error states.
3. Do not display precise addresses, contact information, points, or settlement details beyond the user's authorization and current trip stage.
4. Keep privileged mutations in server routes or server actions. Treat UI validation as helpful feedback, not as enforcement.
5. Verify the changed screen at mobile and desktop widths, then run the applicable lint/build checks.

