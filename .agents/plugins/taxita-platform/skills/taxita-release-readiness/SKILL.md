---
name: taxita-release-readiness
description: Prepare, review, or troubleshoot a TaxiTa Next.js deployment to Vercel, including Preview versus Production environment separation, Neon configuration, build verification, and deployment safety. Use for Vercel release readiness, not for unapproved production deployment.
---

# TaxiTa release readiness

Use the installed `deploy-to-vercel` and `vercel-react-best-practices` skills for their current operational workflow.

1. Inspect the Git remote, `.vercel` linkage, CLI authentication, and deployment target before taking release action.
2. Run `npm run lint` and `npm run build`. Resolve release-blocking errors before deployment.
3. Verify only environment-variable names and presence; never print secret values. Require distinct Preview and Production values for Neon, map providers, and AI providers.
4. Prefer a preview deployment. Ask for explicit approval before linking/creating a Vercel project, changing Vercel settings, pushing, or deploying to production.
5. Report the deployment URL, build status, environment gaps, and rollback path without inventing verification results.

