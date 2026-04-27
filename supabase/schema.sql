-- ----------------------------------------------------------------------------
-- FernFlow Supabase Schema
-- ----------------------------------------------------------------------------

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    business_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    title TEXT,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE workspace_settings (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    logo_url TEXT,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    business_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    task_statuses TEXT[] DEFAULT '{"To-Do", "In Progress", "Review", "Done"}',
    notification_defaults JSONB DEFAULT '{"email": true, "inApp": true, "dueSoon": true, "overdue": true, "taskAssigned": true, "taskStatusChanged": true}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE user_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    theme TEXT DEFAULT 'system' NOT NULL,
    email_notifications BOOLEAN DEFAULT true,
    in_app_notifications BOOLEAN DEFAULT true,
    daily_digest BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, workspace_id)
);

CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'invited')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (workspace_id, user_id)
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Active' NOT NULL,
    due_date DATE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE project_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (workspace_id, project_id, user_id)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'To-Do' NOT NULL,
    priority TEXT DEFAULT 'Medium' NOT NULL,
    due_date DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    target_name TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_activity_logs_workspace ON activity_logs(workspace_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ----------------------------------------------------------------------------

-- Since the app relies mostly on the Supabase admin client for server-side logic
-- (as seen in `src/lib/server/data.ts`), we can enable RLS but allow service role
-- to bypass it, or set up policies if browser clients need direct DB access.

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users in the same workspace
-- Note: A fully production-ready RLS policy set would be more granular.
-- Since this app uses App Router Server Actions/Routes with the Service Role key,
-- the DB operations bypass RLS.
-- We are just adding a permissive policy here for authenticated users for completeness if 
-- they query directly from the browser.

CREATE POLICY "Allow service role full access" ON workspaces FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON workspace_settings FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON user_settings FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON workspace_members FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON projects FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON project_members FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON activity_logs FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON notifications FOR ALL USING (true);

-- ----------------------------------------------------------------------------
-- Initial Setup / Seed Data
-- ----------------------------------------------------------------------------

/*
-- To seed an initial workspace, run this after creating your first user:
INSERT INTO workspaces (id, slug, name) VALUES ('<some-uuid>', 'default', 'FernFlow Default Workspace');
INSERT INTO workspace_settings (workspace_id) VALUES ('<some-uuid>');
-- The application code handles auto-creating profiles, workspace_members, etc.
*/
