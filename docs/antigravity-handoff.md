# FernFlow Supabase Migration Handoff

## Purpose

This document is a handoff guide for Antigravity to continue the FernFlow launch migration.

The goal is to turn the current frontend-heavy prototype into an internal launch-ready product using:

- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- Next.js App Router route handlers
- Real persisted workspace, project, task, member, profile, settings, and notification data

This repo is **not launch-ready yet**. It is currently in a **partial migration state**:

- backend scaffolding exists
- auth scaffolding exists
- dashboard and project pages were migrated off mock data
- the task page and several product routes are still incomplete
- release hardening and Supabase SQL setup are still missing

## Current Stage

The project is roughly at:

- Phase 1: mostly scaffolded
- Phase 2: partially implemented
- Phase 3: partially scaffolded in navigation and APIs, but not finished in UI
- Phase 0 hardening: still incomplete
- Phase 4 launch readiness: not started

Short version:

- `dashboard-overview` is migrated
- `project-management` is migrated
- `task-list-view` is still on `mockData`
- `/team`, `/settings`, `/profile`, `/notifications` UI routes do not exist yet
- auth/login/logout/callback scaffolding exists
- API routes and server data layer exist
- production hardening is not done

## What Has Already Been Implemented

### 1. Shared domain types and utility layer

New shared types were added in:

- `src/lib/types.ts`

This now contains the main app domain model:

- `Workspace`
- `UserProfile`
- `WorkspaceMember`
- `TeamMemberSummary`
- `Project`
- `Task`
- `ActivityLog`
- `Notification`
- `WorkspaceSettings`
- `UserSettings`
- `DashboardPayload`
- `AppShellData`
- request payload types like `ProjectInput`, `TaskInput`, `ProfileUpdateInput`, `WorkspaceSettingsInput`

Utility logic was also modernized in:

- `src/lib/utils.ts`

This includes runtime date helpers and removes hardcoded mock-style time logic.

### 2. Supabase environment and client setup

Added:

- `src/lib/env.ts`
- `src/lib/supabase/browser.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/middleware.ts`
- `middleware.ts`

This gives the app:

- browser Supabase client
- server Supabase client
- admin/service-role client
- middleware session refresh
- env parsing helpers

Important note:

- server operations depend on `SUPABASE_SERVICE_ROLE_KEY`
- current repo still has a tracked `.env`, which must be fixed before launch

### 3. Server app context bootstrap

Added:

- `src/lib/server/app-context.ts`

This file now:

- gets the authenticated user
- ensures a default workspace exists
- ensures workspace settings exist
- ensures a `profiles` row exists
- ensures a `user_settings` row exists
- ensures a `workspace_members` row exists
- maps the app shell user
- returns `AppShellData`
- exposes admin/member guards

This is the core auth-aware workspace bootstrap layer.

### 4. Server data layer

Added:

- `src/lib/server/data.ts`

This is the main backend application data layer. It already contains read and write logic for:

- dashboard data
- projects
- tasks
- team
- profile
- settings
- notifications
- activity logs

It already includes logic for:

- project CRUD
- task CRUD
- team invite/update
- profile update
- workspace settings update
- mark one notification read
- mark all notifications read
- activity log creation
- notification creation
- task due-soon and overdue notification generation
- project-member syncing
- member-project syncing

This file should be reused, not replaced.

### 5. Validation and route handlers

Added:

- `src/lib/validators.ts`
- `src/lib/server/api.ts`

Added API routes:

- `src/app/api/projects/route.ts`
- `src/app/api/projects/[id]/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/tasks/[id]/route.ts`
- `src/app/api/dashboard/metrics/route.ts`
- `src/app/api/activity/route.ts`
- `src/app/api/team/route.ts`
- `src/app/api/team/invite/route.ts`
- `src/app/api/team/[memberId]/route.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/settings/route.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/route.ts`
- `src/app/api/notifications/mark-all-read/route.ts`

The API contract is mostly in place.

### 6. Auth entry points

Added:

- `src/app/auth/callback/route.ts`
- `src/app/auth/signout/route.ts`
- `src/app/login/page.tsx`
- `src/components/auth/LoginForm.tsx`

This gives the app:

- Google sign-in flow
- magic link sign-in flow
- callback handling
- sign-out flow

### 7. App shell and navigation improvements

Updated or added:

- `src/components/AppLayout.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Topbar.tsx`
- `src/components/UserMenu.tsx`
- `src/components/NotificationDrawer.tsx`

What is now working in the shell:

- shell accepts authenticated workspace/app-shell data
- Team and Settings nav links now point to real intended routes
- profile menu exists
- notification drawer exists
- unread count exists
- realtime notification refresh via Supabase Realtime exists in the shell
- dark mode toggle is wired in the shell

Important nuance:

- the shell is ready for the missing pages, but those pages themselves still need to be built

### 8. Dashboard migration

Migrated:

- `src/app/dashboard-overview/page.tsx`
- dashboard child components under `src/app/dashboard-overview/components/`

This page now uses real server data instead of `mockData`.

### 9. Project management migration

Migrated:

- `src/app/project-management/page.tsx`
- `src/app/project-management/components/ProjectManagementClient.tsx`
- `src/app/project-management/components/ProjectGrid.tsx`
- `src/app/project-management/components/ProjectDetailPanel.tsx`
- `src/app/project-management/components/ProjectFormModal.tsx`

This area now:

- loads server data
- uses real CRUD APIs
- persists project changes
- refreshes after writes

## What Is Still Incomplete

### 1. Task list page is still using mock data

These files still import `@/lib/mockData`:

- `src/app/task-list-view/page.tsx`
- `src/app/task-list-view/components/TaskFilterPanel.tsx`
- `src/app/task-list-view/components/TaskFormModal.tsx`
- `src/app/task-list-view/components/TaskKanban.tsx`
- `src/app/task-list-view/components/TaskTable.tsx`

This is the biggest unfinished app page migration.

### 2. Missing product pages

These routes still need UI pages and client logic:

- `/team`
- `/settings`
- `/profile`
- `/notifications`

The APIs and shell hooks exist, but the page-level implementation is still missing.

### 3. Root app hardening is not done

Still needs work:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- optional `src/app/loading.tsx`
- optional `src/app/error.tsx`
- `src/app/not-found.tsx`

Current problems:

- root layout still contains Rocket script tags
- root metadata still uses `ProjectFlow` wording
- no global `Toaster` added yet
- root page still blindly redirects to `/dashboard-overview` instead of respecting auth state

### 4. Config and security hardening are still open

Still needs work:

- `.gitignore`
- `.env.example`
- `next.config.mjs`
- `package.json`
- `README.md`

Current problems:

- `.env` is tracked
- no `.env.example`
- `next.config.mjs` still ignores TypeScript and ESLint build errors
- `npm start` still runs `next dev`
- README is still generic and Rocket-branded

### 5. Supabase SQL migration is missing

The app-side code assumes these tables exist, but SQL migrations have **not** been added yet:

- `workspaces`
- `profiles`
- `workspace_members`
- `projects`
- `project_members`
- `tasks`
- `activity_logs`
- `notifications`
- `workspace_settings`
- `user_settings`

RLS policies and seed/setup SQL are also still missing.

### 6. Validation/build verification has not been completed

These have not been completed successfully yet:

- `npm run type-check`
- `npm run lint`
- `npm run build`

The migration is not considered complete until all three pass without ignore flags.

## Recommended Next Execution Order For Antigravity

Follow this order to reduce churn and avoid rework.

### Step 1. Finish the task-list migration

Convert `task-list-view` to the same architecture as `project-management`:

- make `src/app/task-list-view/page.tsx` a server page
- fetch `getAppShellData()` and `getTasksPageData()`
- wrap page with `AppLayout`
- create a new `TaskListViewClient` client component
- refactor task child components to use `@/lib/types`
- wire create/edit/delete/status changes to `/api/tasks`

Definition of done:

- no `@/lib/mockData` usage remains in active page code
- task CRUD persists after refresh
- kanban moves persist
- filters/search still work
- bulk delete and bulk status change work

### Step 2. Build `/team`

Use:

- `getAppShellData()`
- `getTeamPageData()`
- `/api/team`
- `/api/team/invite`
- `/api/team/[memberId]`

Minimum UI:

- member directory list or card grid
- invite teammate modal
- role update
- active/inactive/invited status display and update
- project membership assignment
- workload summary
- recent member activity counts

### Step 3. Build `/profile`

Use:

- `getAppShellData()`
- `getProfilePageData()`
- `/api/profile`

Minimum UI:

- editable full name
- editable title
- avatar URL
- timezone
- theme
- personal notification preferences
- assigned task summary
- recent activity list
- auth/security section with sign-out

### Step 4. Build `/settings`

Use:

- `getAppShellData()`
- `getSettingsPageData()`
- `/api/settings`

Minimum UI:

- workspace name
- logo URL
- timezone
- business days
- notification defaults
- current workflow display

Important note:

- task statuses are currently hardcoded across the UI
- do not make workflow changes that break the existing task UI unless you also update all task status consumers

### Step 5. Build `/notifications`

Use:

- `getAppShellData()`
- `getNotificationsData()`
- `/api/notifications`
- `/api/notifications/[id]`
- `/api/notifications/mark-all-read`

Minimum UI:

- All and Unread filters
- mark read/unread
- mark all read
- links into related records
- empty state

### Step 6. Harden the root app and config

Apply:

- add `Toaster` in `src/app/layout.tsx`
- remove Rocket script tags from root layout
- update metadata to FernFlow branding
- make `src/app/page.tsx` auth-aware
- add `loading.tsx` and `error.tsx`
- clean `not-found.tsx`
- change `package.json` so `start` uses `next start -p 4028`
- remove ignore flags from `next.config.mjs`
- add `.env*` ignore rules
- add `.env.example`
- rewrite README for real setup and launch notes

### Step 7. Add Supabase SQL migration(s)

Add a `supabase/` migration or schema file with:

- table definitions
- foreign keys
- timestamps
- constraints
- indexes
- RLS policies
- seed/default workspace guidance

The app code already assumes the backend schema exists.

### Step 8. Run the release gates

Run and fix all failures:

- `npm run type-check`
- `npm run lint`
- `npm run build`

Then run a quick manual smoke test:

- login
- dashboard
- projects CRUD
- tasks CRUD
- team invite/update
- profile save
- settings save
- notification read/unread

## Known Risks / Important Notes

### 1. `mockData` removal is not complete

Current remaining references are only in `task-list-view`, but Antigravity should verify again before finalizing.

### 2. Route handler responses are not always normalized domain objects

Some POST/PATCH handlers currently return raw Supabase rows. The existing client pattern already refreshes with GET after writes, which is acceptable. If Antigravity wants cleaner contracts, that can be normalized later, but it is not the first priority.

### 3. Dashboard metric nuance

`teamCount` currently counts unique task assignees, not all active workspace members. This should likely be adjusted to count active members for a truer dashboard metric.

### 4. Environment assumptions

Server-side mutations require:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Without these, the backend layer will fail at runtime.

### 5. `graphify-out` is missing

The repo-level AGENTS instructions mention a `graphify-out/` knowledge graph, but it is not present in this checkout.

Antigravity should:

- proceed without it
- optionally run `graphify update .` after major code changes if Graphify is installed and available

## Suggested Deliverables Antigravity Should Produce Next

Antigravity should aim to leave the repo with:

- no active page using `mockData`
- real UI pages for Team, Settings, Profile, Notifications
- root hardening complete
- Supabase schema SQL present
- `.env.example` present
- `.env` ignored
- lint/typecheck/build passing
- updated README

## High-Value Files To Reuse Instead Of Rebuilding

Antigravity should build on these files:

- `src/lib/types.ts`
- `src/lib/server/app-context.ts`
- `src/lib/server/data.ts`
- `src/lib/validators.ts`
- `src/components/AppLayout.tsx`
- `src/components/UserMenu.tsx`
- `src/components/NotificationDrawer.tsx`
- `src/app/project-management/components/ProjectManagementClient.tsx`
- `src/app/dashboard-overview/page.tsx`

These are the best examples of the new architecture already in place.

## Quick Summary

The migration is underway, but not finished.

Already done:

- Supabase scaffolding
- auth scaffolding
- server data layer
- route handlers
- app shell modernization
- dashboard migration
- project page migration

Still to do:

- task page migration
- Team page
- Profile page
- Settings page
- Notifications page
- root/config hardening
- Supabase SQL schema
- release validation

This should be treated as a **continuation handoff**, not a fresh rebuild.
