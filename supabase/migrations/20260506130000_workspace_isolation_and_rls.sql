-- ----------------------------------------------------------------------------
-- Workspace Isolation Hardening (Jira-style multi-workspace foundation)
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1) Non-destructive backfill for workspace-scoped tables
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  default_workspace_id UUID;
BEGIN
  SELECT id
  INTO default_workspace_id
  FROM workspaces
  ORDER BY created_at ASC
  LIMIT 1;

  IF default_workspace_id IS NULL THEN
    INSERT INTO workspaces (slug, name, timezone)
    VALUES ('default', 'FernFlow Default Workspace', 'UTC')
    RETURNING id INTO default_workspace_id;
  END IF;

  INSERT INTO workspace_settings (workspace_id)
  VALUES (default_workspace_id)
  ON CONFLICT (workspace_id) DO NOTHING;

  UPDATE projects
  SET workspace_id = default_workspace_id
  WHERE workspace_id IS NULL;

  UPDATE tasks
  SET workspace_id = COALESCE(
    workspace_id,
    (SELECT p.workspace_id FROM projects p WHERE p.id = tasks.project_id LIMIT 1),
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

  UPDATE notifications
  SET workspace_id = default_workspace_id
  WHERE workspace_id IS NULL;

  UPDATE activity_logs
  SET workspace_id = default_workspace_id
  WHERE workspace_id IS NULL;

  UPDATE project_members
  SET workspace_id = COALESCE(
    workspace_id,
    (SELECT p.workspace_id FROM projects p WHERE p.id = project_members.project_id LIMIT 1),
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

  UPDATE user_settings
  SET workspace_id = default_workspace_id
  WHERE workspace_id IS NULL;

  UPDATE workspace_members
  SET workspace_id = default_workspace_id
  WHERE workspace_id IS NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 2) Workspace preference storage (for future workspace switching)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_workspace_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_workspace_preferences_workspace
  ON user_workspace_preferences(current_workspace_id);

INSERT INTO user_workspace_preferences (user_id, current_workspace_id)
SELECT DISTINCT ON (wm.user_id) wm.user_id, wm.workspace_id
FROM workspace_members wm
WHERE wm.status = 'active'
ORDER BY wm.user_id, wm.joined_at ASC NULLS LAST
ON CONFLICT (user_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3) Helpful workspace indexes for tenant-scoped query performance
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_projects_workspace_status
  ON projects(workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_workspace_status_due
  ON tasks(workspace_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_notifications_workspace_user_created
  ON notifications(workspace_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_workspace_user_type_link
  ON notifications(workspace_id, user_id, type, link);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_user_status
  ON workspace_members(workspace_id, user_id, status);

-- ----------------------------------------------------------------------------
-- 4) RLS helper functions
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION app_is_workspace_member(target_workspace UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = target_workspace
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION app_is_workspace_admin(target_workspace UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = target_workspace
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
      AND wm.role IN ('owner', 'admin')
  );
$$;

-- ----------------------------------------------------------------------------
-- 5) Replace permissive policies with workspace membership policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow service role full access" ON workspaces;
DROP POLICY IF EXISTS "Allow service role full access" ON profiles;
DROP POLICY IF EXISTS "Allow service role full access" ON workspace_settings;
DROP POLICY IF EXISTS "Allow service role full access" ON user_settings;
DROP POLICY IF EXISTS "Allow service role full access" ON workspace_members;
DROP POLICY IF EXISTS "Allow service role full access" ON projects;
DROP POLICY IF EXISTS "Allow service role full access" ON project_members;
DROP POLICY IF EXISTS "Allow service role full access" ON tasks;
DROP POLICY IF EXISTS "Allow service role full access" ON activity_logs;
DROP POLICY IF EXISTS "Allow service role full access" ON notifications;

ALTER TABLE user_workspace_preferences ENABLE ROW LEVEL SECURITY;

-- Workspaces
CREATE POLICY "workspaces_select_member"
  ON workspaces FOR SELECT
  USING (app_is_workspace_member(id));

-- Profiles
CREATE POLICY "profiles_select_self"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_self"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Workspace settings
CREATE POLICY "workspace_settings_select_member"
  ON workspace_settings FOR SELECT
  USING (app_is_workspace_member(workspace_id));

CREATE POLICY "workspace_settings_update_admin"
  ON workspace_settings FOR UPDATE
  USING (app_is_workspace_admin(workspace_id))
  WITH CHECK (app_is_workspace_admin(workspace_id));

-- User settings
CREATE POLICY "user_settings_select_self_member"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid() AND app_is_workspace_member(workspace_id));

CREATE POLICY "user_settings_update_self_member"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid() AND app_is_workspace_member(workspace_id))
  WITH CHECK (user_id = auth.uid() AND app_is_workspace_member(workspace_id));

-- Workspace members
CREATE POLICY "workspace_members_select_member"
  ON workspace_members FOR SELECT
  USING (app_is_workspace_member(workspace_id));

CREATE POLICY "workspace_members_modify_admin"
  ON workspace_members FOR ALL
  USING (app_is_workspace_admin(workspace_id))
  WITH CHECK (app_is_workspace_admin(workspace_id));

-- Projects
CREATE POLICY "projects_member_access"
  ON projects FOR ALL
  USING (app_is_workspace_member(workspace_id))
  WITH CHECK (app_is_workspace_member(workspace_id));

-- Project members
CREATE POLICY "project_members_member_access"
  ON project_members FOR ALL
  USING (app_is_workspace_member(workspace_id))
  WITH CHECK (app_is_workspace_member(workspace_id));

-- Tasks
CREATE POLICY "tasks_member_access"
  ON tasks FOR ALL
  USING (app_is_workspace_member(workspace_id))
  WITH CHECK (app_is_workspace_member(workspace_id));

-- Activity logs
CREATE POLICY "activity_logs_member_access"
  ON activity_logs FOR ALL
  USING (app_is_workspace_member(workspace_id))
  WITH CHECK (app_is_workspace_member(workspace_id));

-- Notifications
CREATE POLICY "notifications_select_own_member"
  ON notifications FOR SELECT
  USING (user_id = auth.uid() AND app_is_workspace_member(workspace_id));

CREATE POLICY "notifications_update_own_member"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid() AND app_is_workspace_member(workspace_id))
  WITH CHECK (user_id = auth.uid() AND app_is_workspace_member(workspace_id));

-- Workspace preferences
CREATE POLICY "workspace_preferences_select_self"
  ON user_workspace_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "workspace_preferences_upsert_self"
  ON user_workspace_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_preferences_update_self"
  ON user_workspace_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

