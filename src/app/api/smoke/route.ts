import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_BUSINESS_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_TASK_STATUSES = ['To-Do', 'In Progress', 'Review', 'Done'];
const DEFAULT_NOTIFICATION_DEFAULTS = {
  email: true,
  inApp: true,
  dueSoon: true,
  overdue: true,
  taskAssigned: true,
  taskStatusChanged: true,
};

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;
type SmokeCheck = boolean | 'skipped';
type WorkspaceRow = {
  id: string;
  slug: string;
  name: string;
  timezone: string;
};
type WorkspaceSettingsRow = {
  workspace_id: string;
};
type ProjectRow = {
  id: string;
  status: string;
};
type TaskRow = {
  id: string;
  status: string;
};
type NotificationRow = {
  id: string;
  title: string;
};

function normalizeSmokeToken(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.replace(/[\r\n]+/g, '').trim();
  return normalized.length > 0 ? normalized : null;
}

function unauthorized(message: string, status = 401) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function ensureWorkspace(admin: AdminClient, slug: string, name: string) {
  const { data: existingWorkspace, error: workspaceError } = await admin
    .from('workspaces')
    .select('id, slug, name, timezone')
    .eq('slug', slug)
    .maybeSingle();

  if (workspaceError) {
    throw new Error(workspaceError.message);
  }

  if (existingWorkspace) {
    return existingWorkspace as WorkspaceRow;
  }

  const { data: createdWorkspace, error: insertError } = await admin
    .from('workspaces')
    .insert({ slug, name, timezone: 'Asia/Colombo' })
    .select('id, slug, name, timezone')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return createdWorkspace as WorkspaceRow;
}

async function ensureWorkspaceSettings(admin: AdminClient, workspaceId: string) {
  const { data: existingSettings, error: existingSettingsError } = await admin
    .from('workspace_settings')
    .select('workspace_id')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  if (existingSettingsError) {
    throw new Error(existingSettingsError.message);
  }

  if (existingSettings) {
    return existingSettings as WorkspaceSettingsRow;
  }

  const { error: upsertError } = await admin.from('workspace_settings').upsert(
    {
      workspace_id: workspaceId,
      timezone: 'Asia/Colombo',
      business_days: DEFAULT_BUSINESS_DAYS,
      task_statuses: DEFAULT_TASK_STATUSES,
      notification_defaults: DEFAULT_NOTIFICATION_DEFAULTS,
    },
    { onConflict: 'workspace_id' }
  );

  if (upsertError) {
    throw new Error(upsertError.message);
  }
}

export async function POST(request: Request) {
  if (process.env.CI_SMOKE_ENABLED !== 'true') {
    return unauthorized('Protected smoke checks are disabled.', 404);
  }

  const providedToken = normalizeSmokeToken(request.headers.get('x-ci-smoke-token'));
  const expectedToken = normalizeSmokeToken(process.env.CI_SMOKE_TOKEN);

  if (!expectedToken) {
    return unauthorized('CI_SMOKE_TOKEN is not configured for this environment.', 500);
  }

  if (!providedToken) {
    return unauthorized('Missing x-ci-smoke-token header.');
  }

  if (providedToken !== expectedToken) {
    return unauthorized('Invalid smoke token.', 403);
  }

  const admin = createSupabaseAdminClient();
  const env = getServerEnv();
  const workspaceSlug = slugify(env.FERNFLOW_WORKSPACE_SLUG || env.FERNFLOW_WORKSPACE_NAME);
  const workspace = await ensureWorkspace(admin, workspaceSlug, env.FERNFLOW_WORKSPACE_NAME);
  await ensureWorkspaceSettings(admin, workspace.id);

  const runId = randomUUID();
  const dueDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const checks: Record<string, SmokeCheck> = {
    workspaceReady: true,
    settingsReadable: false,
    projectCrud: false,
    taskCrud: false,
    profileReadable: 'skipped',
    notificationCrud: 'skipped',
  };

  let projectId = null;
  let taskId = null;
  let notificationId = null;

  try {
    const { data: settingsRow, error: settingsError } = await admin
      .from('workspace_settings')
      .select('workspace_id, timezone')
      .eq('workspace_id', workspace.id)
      .single();

    if (settingsError) {
      throw new Error(settingsError.message);
    }

    checks.settingsReadable = Boolean(settingsRow?.workspace_id);

    const { data: ownerProfile, error: profileError } = env.FERNFLOW_OWNER_EMAIL
      ? await admin
          .from('profiles')
          .select('id, email')
          .eq('email', env.FERNFLOW_OWNER_EMAIL)
          .maybeSingle()
      : { data: null, error: null };

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (ownerProfile) {
      checks.profileReadable = true;
    }

    const { data: createdProject, error: projectError } = await admin
      .from('projects')
      .insert({
        workspace_id: workspace.id,
        title: `CI Smoke Project ${runId}`,
        description: 'Synthetic project created by the FernFlow CI smoke route.',
        status: 'Active',
        due_date: dueDate,
        tags: ['ci', 'smoke'],
        created_by: ownerProfile?.id ?? null,
      })
      .select('id, status')
      .single();

    if (projectError) {
      throw new Error(projectError.message);
    }

    projectId = (createdProject as ProjectRow).id;

    const { data: updatedProject, error: updateProjectError } = await admin
      .from('projects')
      .update({ status: 'On Hold' })
      .eq('id', projectId)
      .select('id, status')
      .single();

    if (updateProjectError) {
      throw new Error(updateProjectError.message);
    }

    checks.projectCrud = (updatedProject as ProjectRow).status === 'On Hold';

    const { data: createdTask, error: taskError } = await admin
      .from('tasks')
      .insert({
        workspace_id: workspace.id,
        project_id: projectId,
        title: `CI Smoke Task ${runId}`,
        description: 'Synthetic task created by the FernFlow CI smoke route.',
        assignee_id: ownerProfile?.id ?? null,
        status: 'To-Do',
        priority: 'Medium',
        due_date: dueDate,
        created_by: ownerProfile?.id ?? null,
      })
      .select('id, status')
      .single();

    if (taskError) {
      throw new Error(taskError.message);
    }

    taskId = (createdTask as TaskRow).id;

    const { data: updatedTask, error: updateTaskError } = await admin
      .from('tasks')
      .update({ status: 'Review' })
      .eq('id', taskId)
      .select('id, status')
      .single();

    if (updateTaskError) {
      throw new Error(updateTaskError.message);
    }

    checks.taskCrud = (updatedTask as TaskRow).status === 'Review';

    if (ownerProfile) {
      const { data: createdNotification, error: notificationError } = await admin
        .from('notifications')
        .insert({
          workspace_id: workspace.id,
          user_id: ownerProfile.id,
          type: 'workspace_updated',
          title: `CI smoke notification ${runId}`,
          body: 'Synthetic notification generated by FernFlow CI.',
          link: '/notifications',
          is_read: false,
          metadata: { source: 'ci-smoke' },
        })
        .select('id, title')
        .single();

      if (notificationError) {
        throw new Error(notificationError.message);
      }

      notificationId = (createdNotification as NotificationRow).id;
      checks.notificationCrud = (createdNotification as NotificationRow).title.includes(
        'CI smoke notification'
      );
    }

    return NextResponse.json({
      ok: true,
      checkedAt: new Date().toISOString(),
      workspaceSlug,
      checks,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected smoke route error.',
      },
      { status: 500 }
    );
  } finally {
    if (notificationId) {
      await admin.from('notifications').delete().eq('id', notificationId);
    }

    if (taskId) {
      await admin.from('tasks').delete().eq('id', taskId);
    }

    if (projectId) {
      await admin.from('projects').delete().eq('id', projectId);
    }
  }
}
