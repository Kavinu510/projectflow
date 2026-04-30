# FernFlow CI/CD Runbook

FernFlow now ships with a multi-stage GitHub Actions pipeline that validates the app, validates
Supabase migrations, deploys to Netlify, and smoke-tests each environment.

## Workflows

- `PR Validation`: dependency review, secret scan, reusable validation, preview deploy, preview smoke tests.
- `Staging Release`: runs on `main`, applies staging migrations, deploys staging, and runs smoke tests.
- `Production Promotion`: manual promotion for an approved commit SHA, with protected production deploy.
- `Security Maintenance`: weekly secret scan and dependency audit.
- `CodeQL`: static security analysis for JavaScript/TypeScript.

## Shared Non-Prod Supabase Secrets

Preview and staging now share the same non-production Supabase project. Configure these repository
secrets once and use them for both environments:

- `NONPROD_NEXT_PUBLIC_SUPABASE_URL`
- `NONPROD_NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NONPROD_SUPABASE_SERVICE_ROLE_KEY`
- `NONPROD_SUPABASE_PROJECT_ID`
- `NONPROD_SUPABASE_DB_PASSWORD`

## Preview-Specific Secrets

These secrets stay preview-specific because they describe the deploy target, workspace identity,
and smoke-test access for PR environments.

- `PREVIEW_NEXT_PUBLIC_SITE_URL`
- `PREVIEW_FERNFLOW_WORKSPACE_SLUG`
- `PREVIEW_FERNFLOW_WORKSPACE_NAME`
- `PREVIEW_FERNFLOW_OWNER_EMAIL`
- `PREVIEW_CI_SMOKE_TOKEN`
- `PREVIEW_NETLIFY_SITE_ID`

## Staging-Specific Secrets

These stay staging-specific because the non-prod Netlify site's `main` deploy still needs its own
workspace identity, site URL, and smoke-test token.

- `STAGING_NEXT_PUBLIC_SITE_URL`
- `STAGING_FERNFLOW_WORKSPACE_SLUG`
- `STAGING_FERNFLOW_WORKSPACE_NAME`
- `STAGING_FERNFLOW_OWNER_EMAIL`
- `STAGING_CI_SMOKE_TOKEN`
- `STAGING_NETLIFY_SITE_ID`

## Production Secrets

Production remains fully isolated on its own Supabase project and Netlify site.

- `PROD_NEXT_PUBLIC_SUPABASE_URL`
- `PROD_NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PROD_SUPABASE_SERVICE_ROLE_KEY`
- `PROD_NEXT_PUBLIC_SITE_URL`
- `PROD_FERNFLOW_WORKSPACE_SLUG`
- `PROD_FERNFLOW_WORKSPACE_NAME`
- `PROD_FERNFLOW_OWNER_EMAIL`
- `PROD_CI_SMOKE_TOKEN`
- `PROD_NETLIFY_SITE_ID`
- `PROD_SUPABASE_PROJECT_ID`
- `PROD_SUPABASE_DB_PASSWORD`

## Shared Platform Secrets

- `NETLIFY_AUTH_TOKEN`
- `SUPABASE_ACCESS_TOKEN`

## Netlify Context-Specific Runtime Setup

Each Netlify site must also have matching runtime variables set in its site configuration because
FernFlow reads Supabase and smoke-route configuration at request time, not only during build.

Set these runtime variable keys on both the non-prod and prod sites:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FERNFLOW_WORKSPACE_SLUG`
- `FERNFLOW_WORKSPACE_NAME`
- `FERNFLOW_OWNER_EMAIL`
- `CI_SMOKE_ENABLED=true`
- `CI_SMOKE_TOKEN`

For the non-prod Netlify site:

- Use the shared non-prod Supabase values for `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in every context.
- Use the `Deploy Preview` context for preview-only values:
  `NEXT_PUBLIC_SITE_URL`, `FERNFLOW_WORKSPACE_SLUG`, `FERNFLOW_WORKSPACE_NAME`,
  `FERNFLOW_OWNER_EMAIL`, and `CI_SMOKE_TOKEN`.
- Use the non-prod site's `Production` context for staging-only values:
  `NEXT_PUBLIC_SITE_URL`, `FERNFLOW_WORKSPACE_SLUG`, `FERNFLOW_WORKSPACE_NAME`,
  `FERNFLOW_OWNER_EMAIL`, and `CI_SMOKE_TOKEN`.

For the prod Netlify site:

- Use only production values for every runtime variable.

## GitHub Repository Settings

- Protect `main` and require pull requests.
- Require these checks before merge:
  - `Dependency Review`
  - `Secret Scan`
  - `Validate FernFlow`
  - `Deploy Preview And Smoke Test`
  - `CodeQL / Analyze`
- If available on your GitHub plan, create a `production` environment with required reviewers.
- Keep `CODEOWNERS` pointed at the real code owners for workflows and `supabase/`.

## Operational Notes

- Run `npm run db:start` locally before `npm run db:validate`.
- Preview and staging can point at the same Netlify site if you want a single non-production site.
- `Staging Release` now applies migrations with `npm run db:migrate:nonprod`.
- Production promotion is commit-SHA based; only promote SHAs that already passed staging.
- The protected `/api/smoke` route is off unless `CI_SMOKE_ENABLED=true`.

## Cleanup Note

After the first successful PR validation run and the first successful staging release with the new
shared non-prod secrets, remove these old repository secrets:

- `PREVIEW_NEXT_PUBLIC_SUPABASE_URL`
- `PREVIEW_NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PREVIEW_SUPABASE_SERVICE_ROLE_KEY`
- `STAGING_NEXT_PUBLIC_SUPABASE_URL`
- `STAGING_NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_SERVICE_ROLE_KEY`
- `STAGING_SUPABASE_PROJECT_ID`
- `STAGING_SUPABASE_DB_PASSWORD`
