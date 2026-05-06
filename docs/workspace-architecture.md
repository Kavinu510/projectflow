# FernFlow Workspace Architecture (Jira-Style)

## Target Model

- Tenant boundary: `workspace_id`
- Every business entity belongs to a workspace:
  - `projects`
  - `tasks`
  - `notifications`
  - `activity_logs`
  - `project_members`
  - `workspace_settings`
  - `user_settings`
  - `workspace_members`

## Route Architecture (Proposed)

- Canonical:
  - `/workspaces/[workspaceId]/dashboard`
  - `/workspaces/[workspaceId]/projects`
  - `/workspaces/[workspaceId]/tasks`
  - `/workspaces/[workspaceId]/notifications`
  - `/workspaces/[workspaceId]/team`
  - `/workspaces/[workspaceId]/settings`
- API compatibility:
  - Keep existing `/api/*` routes.
  - Add `workspaceId` request context via:
    - `x-workspace-id` header
    - `?workspaceId=` query param
    - runtime cookie fallback (`fernflow-workspace-id`)

## Backward Compatibility Strategy

- Current pages remain unchanged (`/dashboard-overview`, `/project-management`, etc.).
- Existing routes continue working using default/fallback workspace selection.
- New workspace routes can be introduced as aliases that pass workspace context to the same page components.

## Workspace Context Design

- Runtime selectors (already added in code):
  - Header: `x-workspace-id`
  - Query param: `workspaceId`
  - Cookie: `fernflow-workspace-id`
- Server context resolution:
  - If requested workspace is valid for user membership, use it.
  - Else fallback to first active membership.
  - Default workspace bootstrap remains for first-run behavior.

## DB + RLS Rollout Plan

1. Apply migration `20260506130000_workspace_isolation_and_rls.sql`.
2. Backfill nullable `workspace_id` rows to a safe default workspace.
3. Add `user_workspace_preferences` for future workspace switching.
4. Enforce membership-driven RLS policies.
5. Enable workspace-aware API selection using header/query/cookie.
6. Add UI workspace switcher later (no UI redesign required now).

## Risks & Edge Cases

- Users with no active membership:
  - Requests should fail safely with auth/membership error.
- Duplicate notifications:
  - Existence checks must not rely on `.single()`/`.maybeSingle()`.
- Mixed old/new clients:
  - Old clients without workspace selector continue on fallback workspace.
- Cross-workspace websocket updates:
  - Realtime filters should include `workspace_id` + `user_id`.

## Implementation Order (Recommended)

1. DB migration + RLS policy hardening.
2. Backend workspace context resolver.
3. API route workspace context passthrough.
4. Realtime notification scoping by workspace.
5. Introduce `/workspaces/[workspaceId]/*` route wrappers.
6. Add workspace switcher in sidebar/topbar (future UI task).
