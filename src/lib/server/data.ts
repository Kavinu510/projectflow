import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  avatarColorForString,
  clampPercentage,
  getInitials,
  isDueSoon,
  isDueToday,
  isOverdue,
} from '@/lib/utils';
import {
  type ActivityLog,
  type DashboardPayload,
  type Notification,
  type ProfilePageData,
  type Project,
  type ProjectInput,
  type ProjectStatus,
  type SettingsPageData,
  type Task,
  type TaskInput,
  type TaskStatus,
  type TeamInviteInput,
  type TeamMemberSummary,
  type TeamMemberUpdateInput,
  type TeamPageData,
  type UserProfile,
  type WorkspaceMember,
  type WorkspaceRole,
  type WorkspaceSettingsInput,
  type ProfileUpdateInput,
} from '@/lib/types';
import {
  assertAdmin,
  assertWorkspaceMember,
  getAppContext,
  type AppContext,
} from '@/lib/server/app-context';

type RawRow = Record<string, unknown>;

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readNullableString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readArrayOfStrings(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function readMetadata(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

async function requireAppContext() {
  const context = await getAppContext();

  if (!context) {
    throw new Error('Authentication required.');
  }

  assertWorkspaceMember(context);

  return context;
}

function mapTask(row: RawRow): Task {
  return {
    id: readString(row.id),
    workspaceId: readString(row.workspace_id),
    projectId: readString(row.project_id),
    title: readString(row.title),
    description: readString(row.description),
    assigneeId: readNullableString(row.assignee_id),
    status: readString(row.status, 'To-Do') as TaskStatus,
    priority: readString(row.priority, 'Medium') as Task['priority'],
    dueDate: readString(row.due_date),
    createdAt: readString(row.created_at),
    updatedAt: readString(row.updated_at, readString(row.created_at)),
    createdBy: readNullableString(row.created_by),
  };
}

function mapProject(row: RawRow, teamIds: string[], tasks: Task[]): Project {
  const taskCount = tasks.length;
  const completedTaskCount = tasks.filter((task) => task.status === 'Done').length;

  return {
    id: readString(row.id),
    workspaceId: readString(row.workspace_id),
    title: readString(row.title),
    description: readString(row.description),
    status: readString(row.status, 'Active') as ProjectStatus,
    progress: taskCount === 0 ? 0 : clampPercentage((completedTaskCount / taskCount) * 100),
    createdAt: readString(row.created_at),
    dueDate: readString(row.due_date),
    teamIds,
    taskCount,
    completedTaskCount,
    tags: readArrayOfStrings(row.tags),
    createdBy: readNullableString(row.created_by),
  };
}

function mapActivity(row: RawRow): ActivityLog {
  return {
    id: readString(row.id),
    workspaceId: readString(row.workspace_id),
    actorId: readNullableString(row.actor_id),
    action: readString(row.action),
    targetType: readString(row.target_type, 'task') as ActivityLog['targetType'],
    targetId: readNullableString(row.target_id),
    targetName: readString(row.target_name),
    metadata: readMetadata(row.metadata),
    createdAt: readString(row.created_at),
  };
}

function mapNotification(row: RawRow): Notification {
  return {
    id: readString(row.id),
    workspaceId: readString(row.workspace_id),
    userId: readString(row.user_id),
    type: readString(row.type) as Notification['type'],
    title: readString(row.title),
    body: readString(row.body),
    link: readNullableString(row.link),
    isRead: readBoolean(row.is_read),
    metadata: readMetadata(row.metadata),
    createdAt: readString(row.created_at),
    readAt: readNullableString(row.read_at),
  };
}

function mapUserProfile(profileRow: RawRow, settingsRow?: RawRow | null): UserProfile {
  const fullName = readString(profileRow.full_name, 'FernFlow User');

  return {
    id: readString(profileRow.id),
    email: readString(profileRow.email),
    fullName,
    initials: getInitials(fullName),
    color: avatarColorForString(readString(profileRow.id, fullName)),
    avatarUrl: readNullableString(profileRow.avatar_url),
    title: readNullableString(profileRow.title),
    timezone: readString(settingsRow?.timezone ?? profileRow.timezone, 'Asia/Colombo'),
    theme:
      readString(settingsRow?.theme, 'system') === 'dark'
        ? 'dark'
        : readString(settingsRow?.theme, 'system') === 'light'
          ? 'light'
          : 'system',
  };
}

function mapWorkspaceMember(
  memberRow: RawRow,
  profileRow: RawRow,
  settingsRow?: RawRow | null
): WorkspaceMember {
  return {
    id: readString(memberRow.id),
    workspaceId: readString(memberRow.workspace_id),
    userId: readString(memberRow.user_id),
    role: readString(memberRow.role, 'member') as WorkspaceRole,
    status: readString(memberRow.status, 'active') as WorkspaceMember['status'],
    joinedAt: readNullableString(memberRow.joined_at),
    invitedAt: readNullableString(memberRow.invited_at),
    profile: mapUserProfile(profileRow, settingsRow),
  };
}

async function fetchProjectsTasksAndMembers(context: AppContext) {
  const admin = createSupabaseAdminClient();
  const workspaceId = context.workspace.id;

  const [
    { data: projectRows, error: projectError },
    { data: taskRows, error: taskError },
    { data: projectMemberRows, error: projectMemberError },
  ] = await Promise.all([
    admin
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('due_date', { ascending: true }),
    admin
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('due_date', { ascending: true }),
    admin.from('project_members').select('*').eq('workspace_id', workspaceId),
  ]);

  if (projectError) {
    throw new Error(projectError.message);
  }

  if (taskError) {
    throw new Error(taskError.message);
  }

  if (projectMemberError) {
    throw new Error(projectMemberError.message);
  }

  const tasks = (taskRows ?? []).map((row) => mapTask(row as RawRow));
  const projectMembersByProjectId = new Map<string, string[]>();

  (projectMemberRows ?? []).forEach((row) => {
    const projectId = readString((row as RawRow).project_id);
    const userId = readString((row as RawRow).user_id);

    if (!projectMembersByProjectId.has(projectId)) {
      projectMembersByProjectId.set(projectId, []);
    }

    projectMembersByProjectId.get(projectId)?.push(userId);
  });

  const projects = (projectRows ?? []).map((row) =>
    mapProject(
      row as RawRow,
      projectMembersByProjectId.get(readString((row as RawRow).id)) ?? [],
      tasks.filter((task) => task.projectId === readString((row as RawRow).id))
    )
  );

  return { admin, projects, tasks };
}

async function fetchWorkspacePeople(context: AppContext) {
  const admin = createSupabaseAdminClient();
  const workspaceId = context.workspace.id;

  const [
    { data: memberRows, error: memberError },
    { data: profileRows, error: profileError },
    { data: settingsRows, error: settingsError },
  ] = await Promise.all([
    admin.from('workspace_members').select('*').eq('workspace_id', workspaceId),
    admin.from('profiles').select('*'),
    admin.from('user_settings').select('*').eq('workspace_id', workspaceId),
  ]);

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  const profileMap = new Map<string, RawRow>();
  const settingsMap = new Map<string, RawRow>();

  (profileRows ?? []).forEach((profile) => {
    profileMap.set(readString((profile as RawRow).id), profile as RawRow);
  });

  (settingsRows ?? []).forEach((settings) => {
    settingsMap.set(readString((settings as RawRow).user_id), settings as RawRow);
  });

  const members = (memberRows ?? [])
    .map((memberRow) => {
      const userId = readString((memberRow as RawRow).user_id);
      const profileRow = profileMap.get(userId);

      if (!profileRow) {
        return null;
      }

      return mapWorkspaceMember(memberRow as RawRow, profileRow, settingsMap.get(userId));
    })
    .filter(Boolean) as WorkspaceMember[];

  return { members, profileMap, settingsMap };
}

async function fetchActivityLogs(workspaceId: string, limit = 20): Promise<ActivityLog[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('activity_logs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapActivity(row as RawRow));
}

async function createActivityLog(
  context: AppContext,
  input: {
    action: string;
    targetType: ActivityLog['targetType'];
    targetId: string | null;
    targetName: string;
    metadata?: Record<string, unknown>;
  }
) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from('activity_logs').insert({
    workspace_id: context.workspace.id,
    actor_id: context.authUser.id,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    target_name: input.targetName,
    metadata: input.metadata ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function createNotification(
  context: AppContext,
  notification: Omit<Notification, 'id' | 'createdAt' | 'readAt' | 'isRead' | 'workspaceId'>
) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from('notifications').insert({
    workspace_id: context.workspace.id,
    user_id: notification.userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    is_read: false,
    metadata: notification.metadata,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function notificationExists(
  workspaceId: string,
  userId: string,
  type: Notification['type'],
  link: string
) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('notifications')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('type', type)
    .eq('link', link)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

async function ensureTaskReminderNotifications(context: AppContext) {
  const { tasks } = await fetchProjectsTasksAndMembers(context);

  for (const task of tasks) {
    if (!task.assigneeId || task.status === 'Done') {
      continue;
    }

    const link = `/task-list-view?taskId=${task.id}`;

    if (isDueToday(task.dueDate) || isDueSoon(task.dueDate)) {
      const dueSoonExists = await notificationExists(
        context.workspace.id,
        task.assigneeId,
        'task_due_soon',
        link
      );

      if (!dueSoonExists) {
        await createNotification(context, {
          userId: task.assigneeId,
          type: 'task_due_soon',
          title: 'Task due soon',
          body: `${task.title} is due on ${task.dueDate}.`,
          link,
          metadata: { taskId: task.id, dueDate: task.dueDate },
        });
      }
    }

    if (isOverdue(task.dueDate)) {
      const overdueExists = await notificationExists(
        context.workspace.id,
        task.assigneeId,
        'task_overdue',
        link
      );

      if (!overdueExists) {
        await createNotification(context, {
          userId: task.assigneeId,
          type: 'task_overdue',
          title: 'Task overdue',
          body: `${task.title} is overdue and needs attention.`,
          link,
          metadata: { taskId: task.id, dueDate: task.dueDate },
        });
      }
    }
  }
}

async function syncProjectMembers(workspaceId: string, projectId: string, teamIds: string[]) {
  const admin = createSupabaseAdminClient();
  const { data: existingRows, error } = await admin
    .from('project_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId);

  if (error) {
    throw new Error(error.message);
  }

  const existingIds = new Set(
    (existingRows ?? []).map((row) => readString((row as RawRow).user_id))
  );
  const nextIds = new Set(teamIds);

  const idsToInsert = teamIds.filter((teamId) => !existingIds.has(teamId));
  const idsToDelete = [...existingIds].filter((teamId) => !nextIds.has(teamId));

  if (idsToInsert.length > 0) {
    const { error: insertError } = await admin.from('project_members').insert(
      idsToInsert.map((teamId) => ({
        workspace_id: workspaceId,
        project_id: projectId,
        user_id: teamId,
      }))
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await admin
      .from('project_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('project_id', projectId)
      .in('user_id', idsToDelete);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }
}

async function syncMemberProjects(workspaceId: string, userId: string, projectIds: string[]) {
  const admin = createSupabaseAdminClient();
  const { data: existingRows, error } = await admin
    .from('project_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  const existingIds = new Set(
    (existingRows ?? []).map((row) => readString((row as RawRow).project_id))
  );
  const nextIds = new Set(projectIds);

  const idsToInsert = projectIds.filter((projectId) => !existingIds.has(projectId));
  const idsToDelete = [...existingIds].filter((projectId) => !nextIds.has(projectId));

  if (idsToInsert.length > 0) {
    const { error: insertError } = await admin.from('project_members').insert(
      idsToInsert.map((projectId) => ({
        workspace_id: workspaceId,
        project_id: projectId,
        user_id: userId,
      }))
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await admin
      .from('project_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .in('project_id', idsToDelete);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }
}

export async function getProjectsPageData() {
  const context = await requireAppContext();
  const { projects, tasks } = await fetchProjectsTasksAndMembers(context);
  const { members } = await fetchWorkspacePeople(context);

  return { shell: context, projects, tasks, members };
}

export async function getTasksPageData() {
  const context = await requireAppContext();
  const { projects, tasks } = await fetchProjectsTasksAndMembers(context);
  const { members } = await fetchWorkspacePeople(context);

  return { shell: context, projects, tasks, members };
}

export async function getDashboardPageData(): Promise<DashboardPayload> {
  const context = await requireAppContext();
  const { projects, tasks } = await fetchProjectsTasksAndMembers(context);
  const { members } = await fetchWorkspacePeople(context);
  const activity = await fetchActivityLogs(context.workspace.id, 8);
  const sevenDayWindow = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  const completedLast7Days = activity.filter((entry) => entry.action === 'completed').length;
  const createdLast7Days = tasks.filter((task) => {
    const createdAt = new Date(task.createdAt);
    const now = new Date();

    return now.getTime() - createdAt.getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return {
    metrics: {
      activeProjects: projects.filter((project) => project.status === 'Active').length,
      dueTodayTasks: tasks.filter((task) => isDueToday(task.dueDate) && task.status !== 'Done')
        .length,
      overdueTasks: tasks.filter((task) => isOverdue(task.dueDate) && task.status !== 'Done')
        .length,
      teamCount: new Set(tasks.map((task) => task.assigneeId).filter(Boolean)).size,
      completionRate:
        tasks.length === 0
          ? 0
          : clampPercentage(
              (tasks.filter((task) => task.status === 'Done').length / tasks.length) * 100
            ),
      reviewTasks: tasks.filter((task) => task.status === 'Review').length,
      completedLast7Days,
      createdLast7Days,
    },
    activity,
    members: members.map((member) => member.profile),
    topProjects: projects
      .filter((project) => project.status === 'Active')
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
      .slice(0, 4),
    myTasks: tasks
      .filter((task) => task.assigneeId === context.authUser.id && task.status !== 'Done')
      .slice(0, 5),
    trendData: sevenDayWindow.map((date) => {
      const key = date.toDateString();
      return {
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: activity.filter(
          (entry) =>
            entry.action === 'completed' && new Date(entry.createdAt).toDateString() === key
        ).length,
        added: tasks.filter((task) => new Date(task.createdAt).toDateString() === key).length,
      };
    }),
    tasksByProjectData: projects.map((project) => ({
      project:
        project.title.length > 14 ? `${project.title.slice(0, 12).trimEnd()}...` : project.title,
      open: tasks.filter((task) => task.projectId === project.id && task.status !== 'Done').length,
      done: tasks.filter((task) => task.projectId === project.id && task.status === 'Done').length,
    })),
  };
}

export async function getTeamPageData(): Promise<TeamPageData> {
  const context = await requireAppContext();
  const { projects, tasks } = await fetchProjectsTasksAndMembers(context);
  const { members } = await fetchWorkspacePeople(context);
  const activity = await fetchActivityLogs(context.workspace.id, 12);

  const projectIdsByUserId = new Map<string, string[]>();

  projects.forEach((project) => {
    project.teamIds.forEach((teamId) => {
      if (!projectIdsByUserId.has(teamId)) {
        projectIdsByUserId.set(teamId, []);
      }

      projectIdsByUserId.get(teamId)?.push(project.id);
    });
  });

  const activityCountByUserId = new Map<string, number>();

  activity.forEach((entry) => {
    if (!entry.actorId) {
      return;
    }

    activityCountByUserId.set(entry.actorId, (activityCountByUserId.get(entry.actorId) ?? 0) + 1);
  });

  const summaries: TeamMemberSummary[] = members.map((member) => ({
    ...member,
    projectIds: projectIdsByUserId.get(member.userId) ?? [],
    assignedTaskCount: tasks.filter(
      (task) => task.assigneeId === member.userId && task.status !== 'Done'
    ).length,
    activeProjectCount: (projectIdsByUserId.get(member.userId) ?? []).length,
    recentActivityCount: activityCountByUserId.get(member.userId) ?? 0,
  }));

  return {
    members: summaries,
    projects,
    tasks,
    activity,
  };
}

export async function getProfilePageData(): Promise<ProfilePageData> {
  const context = await requireAppContext();
  const { tasks } = await fetchProjectsTasksAndMembers(context);
  const recentActivity = await fetchActivityLogs(context.workspace.id, 12);

  return {
    profile: context.profile,
    settings: context.userSettings,
    assignedTasks: tasks.filter((task) => task.assigneeId === context.authUser.id),
    recentActivity: recentActivity.filter((entry) => entry.actorId === context.authUser.id),
  };
}

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const context = await requireAppContext();
  assertAdmin(context);

  return {
    workspace: context.workspace,
    workspaceSettings: context.workspaceSettings,
  };
}

export async function getActivityData(limit = 20) {
  const context = await requireAppContext();
  return fetchActivityLogs(context.workspace.id, limit);
}

export async function getNotificationsData(unreadOnly = false) {
  const context = await requireAppContext();
  await ensureTaskReminderNotifications(context);

  const admin = createSupabaseAdminClient();
  let query = admin
    .from('notifications')
    .select('*')
    .eq('workspace_id', context.workspace.id)
    .eq('user_id', context.authUser.id)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapNotification(row as RawRow));
}

export async function createProjectRecord(input: ProjectInput) {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from('projects')
    .insert({
      workspace_id: context.workspace.id,
      title: input.title,
      description: input.description,
      status: input.status,
      due_date: input.dueDate,
      tags: input.tags,
      created_by: context.authUser.id,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const projectId = readString((data as RawRow).id);
  await syncProjectMembers(context.workspace.id, projectId, input.teamIds);

  await createActivityLog(context, {
    action: 'created project',
    targetType: 'project',
    targetId: projectId,
    targetName: input.title,
    metadata: { teamIds: input.teamIds },
  });

  return data;
}

export async function updateProjectRecord(projectId: string, input: ProjectInput) {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await admin
    .from('projects')
    .select('*')
    .eq('workspace_id', context.workspace.id)
    .eq('id', projectId)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const { data, error } = await admin
    .from('projects')
    .update({
      title: input.title,
      description: input.description,
      status: input.status,
      due_date: input.dueDate,
      tags: input.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', context.workspace.id)
    .eq('id', projectId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await syncProjectMembers(context.workspace.id, projectId, input.teamIds);

  await createActivityLog(context, {
    action: readString((existing as RawRow).status) !== input.status ? 'updated status' : 'updated',
    targetType: 'project',
    targetId: projectId,
    targetName: input.title,
    metadata: {
      previousStatus: readString((existing as RawRow).status),
      nextStatus: input.status,
    },
  });

  return data;
}

export async function deleteProjectRecord(projectId: string) {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await admin
    .from('projects')
    .select('*')
    .eq('workspace_id', context.workspace.id)
    .eq('id', projectId)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const { error } = await admin
    .from('projects')
    .delete()
    .eq('workspace_id', context.workspace.id)
    .eq('id', projectId);

  if (error) {
    throw new Error(error.message);
  }

  await createActivityLog(context, {
    action: 'deleted',
    targetType: 'project',
    targetId: projectId,
    targetName: readString((existing as RawRow).title),
  });
}

export async function createTaskRecord(input: TaskInput) {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from('tasks')
    .insert({
      workspace_id: context.workspace.id,
      project_id: input.projectId,
      title: input.title,
      description: input.description,
      assignee_id: input.assigneeId,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate,
      created_by: context.authUser.id,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const taskId = readString((data as RawRow).id);

  await createActivityLog(context, {
    action: 'created',
    targetType: 'task',
    targetId: taskId,
    targetName: input.title,
    metadata: { projectId: input.projectId },
  });

  if (input.assigneeId && input.assigneeId !== context.authUser.id) {
    await createNotification(context, {
      userId: input.assigneeId,
      type: 'task_assigned',
      title: 'New task assigned',
      body: `${input.title} was assigned to you.`,
      link: `/task-list-view?taskId=${taskId}`,
      metadata: { taskId, projectId: input.projectId },
    });
  }

  return data;
}

export async function updateTaskRecord(taskId: string, input: TaskInput) {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await admin
    .from('tasks')
    .select('*')
    .eq('workspace_id', context.workspace.id)
    .eq('id', taskId)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingTask = mapTask(existing as RawRow);
  const { data, error } = await admin
    .from('tasks')
    .update({
      project_id: input.projectId,
      title: input.title,
      description: input.description,
      assignee_id: input.assigneeId,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', context.workspace.id)
    .eq('id', taskId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (existingTask.assigneeId !== input.assigneeId && input.assigneeId) {
    await createNotification(context, {
      userId: input.assigneeId,
      type: 'task_assigned',
      title: 'Task assigned',
      body: `${input.title} is now assigned to you.`,
      link: `/task-list-view?taskId=${taskId}`,
      metadata: { taskId, previousAssigneeId: existingTask.assigneeId },
    });
  }

  if (existingTask.dueDate !== input.dueDate && input.assigneeId) {
    await createNotification(context, {
      userId: input.assigneeId,
      type: 'task_due_date_changed',
      title: 'Task deadline updated',
      body: `${input.title} now has a due date of ${input.dueDate}.`,
      link: `/task-list-view?taskId=${taskId}`,
      metadata: { taskId, previousDueDate: existingTask.dueDate, nextDueDate: input.dueDate },
    });
  }

  if (existingTask.status !== input.status && input.assigneeId) {
    await createNotification(context, {
      userId: input.assigneeId,
      type: 'task_status_changed',
      title: 'Task status changed',
      body: `${input.title} moved to ${input.status}.`,
      link: `/task-list-view?taskId=${taskId}`,
      metadata: { taskId, previousStatus: existingTask.status, nextStatus: input.status },
    });
  }

  await createActivityLog(context, {
    action:
      existingTask.status !== input.status
        ? input.status === 'Done'
          ? 'completed'
          : 'moved'
        : 'updated',
    targetType: 'task',
    targetId: taskId,
    targetName: input.title,
    metadata: {
      previousStatus: existingTask.status,
      nextStatus: input.status,
      previousDueDate: existingTask.dueDate,
      nextDueDate: input.dueDate,
    },
  });

  return data;
}

export async function deleteTaskRecord(taskId: string) {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await admin
    .from('tasks')
    .select('*')
    .eq('workspace_id', context.workspace.id)
    .eq('id', taskId)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const { error } = await admin
    .from('tasks')
    .delete()
    .eq('workspace_id', context.workspace.id)
    .eq('id', taskId);

  if (error) {
    throw new Error(error.message);
  }

  await createActivityLog(context, {
    action: 'deleted',
    targetType: 'task',
    targetId: taskId,
    targetName: readString((existing as RawRow).title),
  });
}

export async function inviteTeamMemberRecord(input: TeamInviteInput) {
  const context = await requireAppContext();
  assertAdmin(context);

  const admin = createSupabaseAdminClient();
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    : undefined;

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    {
      data: {
        full_name: input.fullName,
        title: input.title ?? null,
      },
      redirectTo,
    }
  );

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  if (!invited.user?.id) {
    throw new Error('Supabase did not return an invited user.');
  }

  const userId = invited.user.id;

  await admin.from('profiles').upsert(
    {
      id: userId,
      email: input.email,
      full_name: input.fullName,
      title: input.title ?? null,
      timezone: 'Asia/Colombo',
    },
    { onConflict: 'id' }
  );

  await admin.from('workspace_members').upsert(
    {
      workspace_id: context.workspace.id,
      user_id: userId,
      role: input.role,
      status: 'invited',
      invited_at: new Date().toISOString(),
      invited_by: context.authUser.id,
    },
    { onConflict: 'workspace_id,user_id' }
  );

  await admin.from('user_settings').upsert(
    {
      user_id: userId,
      workspace_id: context.workspace.id,
      timezone: 'Asia/Colombo',
      theme: 'system',
      email_notifications: true,
      in_app_notifications: true,
      daily_digest: true,
    },
    { onConflict: 'user_id,workspace_id' }
  );

  await createActivityLog(context, {
    action: 'invited',
    targetType: 'member',
    targetId: userId,
    targetName: input.fullName,
    metadata: { email: input.email, role: input.role },
  });

  await createNotification(context, {
    userId,
    type: 'member_invited',
    title: 'You were invited to FernFlow',
    body: `${context.profile.fullName} invited you to join ${context.workspace.name}.`,
    link: '/team',
    metadata: { invitedBy: context.authUser.id, role: input.role },
  });
}

export async function updateTeamMemberRecord(memberId: string, input: TeamMemberUpdateInput) {
  const context = await requireAppContext();
  assertAdmin(context);

  const admin = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await admin
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', context.workspace.id)
    .eq('id', memberId)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingRole = readString((existing as RawRow).role, 'member');
  const targetUserId = readString((existing as RawRow).user_id);
  const nextRole = input.role ?? (existingRole as WorkspaceRole);
  const nextStatus = input.status ?? readString((existing as RawRow).status, 'active');

  const { error } = await admin
    .from('workspace_members')
    .update({
      role: nextRole,
      status: nextStatus,
      joined_at:
        nextStatus === 'active'
          ? new Date().toISOString()
          : ((existing as RawRow).joined_at ?? null),
    })
    .eq('workspace_id', context.workspace.id)
    .eq('id', memberId);

  if (error) {
    throw new Error(error.message);
  }

  if (input.projectIds) {
    await syncMemberProjects(context.workspace.id, targetUserId, input.projectIds);
  }

  await createActivityLog(context, {
    action: 'updated',
    targetType: 'member',
    targetId: targetUserId,
    targetName: targetUserId,
    metadata: { previousRole: existingRole, nextRole, nextStatus },
  });

  if (existingRole !== nextRole) {
    await createNotification(context, {
      userId: targetUserId,
      type: 'member_role_changed',
      title: 'Workspace role updated',
      body: `Your role in ${context.workspace.name} is now ${nextRole}.`,
      link: '/team',
      metadata: { previousRole: existingRole, nextRole },
    });
  }
}

export async function updateProfileRecord(input: ProfileUpdateInput) {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { error: profileError } = await admin
    .from('profiles')
    .update({
      full_name: input.fullName,
      title: input.title || null,
      avatar_url: input.avatarUrl,
      timezone: input.timezone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', context.authUser.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: settingsError } = await admin
    .from('user_settings')
    .update({
      timezone: input.timezone,
      theme: input.theme,
      email_notifications: input.emailNotifications,
      in_app_notifications: input.inAppNotifications,
      daily_digest: input.dailyDigest,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', context.authUser.id);

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  await createActivityLog(context, {
    action: 'updated',
    targetType: 'profile',
    targetId: context.authUser.id,
    targetName: input.fullName,
  });
}

export async function updateWorkspaceSettingsRecord(input: WorkspaceSettingsInput) {
  const context = await requireAppContext();
  assertAdmin(context);

  const admin = createSupabaseAdminClient();

  const { error: workspaceError } = await admin
    .from('workspaces')
    .update({
      name: input.name,
      timezone: input.timezone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', context.workspace.id);

  if (workspaceError) {
    throw new Error(workspaceError.message);
  }

  const { error: settingsError } = await admin
    .from('workspace_settings')
    .update({
      logo_url: input.logoUrl,
      timezone: input.timezone,
      business_days: input.businessDays,
      task_statuses: input.taskStatuses,
      notification_defaults: input.notificationDefaults,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', context.workspace.id);

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  await createActivityLog(context, {
    action: 'updated',
    targetType: 'settings',
    targetId: context.workspace.id,
    targetName: input.name,
  });
}

export async function markNotificationRead(notificationId: string, isRead: boolean) {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from('notifications')
    .update({
      is_read: isRead,
      read_at: isRead ? new Date().toISOString() : null,
    })
    .eq('workspace_id', context.workspace.id)
    .eq('user_id', context.authUser.id)
    .eq('id', notificationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead() {
  const context = await requireAppContext();
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('workspace_id', context.workspace.id)
    .eq('user_id', context.authUser.id)
    .eq('is_read', false);

  if (error) {
    throw new Error(error.message);
  }
}
