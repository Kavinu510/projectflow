import { type User } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { resolveWorkspaceIdFromRuntimeContext } from '@/lib/server/workspace-context';
import { avatarColorForString, getInitials, slugify } from '@/lib/utils';
import {
  BUSINESS_DAY_OPTIONS,
  TASK_STATUS_OPTIONS,
  type AppShellData,
  type AppShellUser,
  type Notification,
  type ThemeMode,
  type UserProfile,
  type UserSettings,
  type Workspace,
  type WorkspaceMember,
  type WorkspaceRole,
  type WorkspaceSettings,
} from '@/lib/types';

type RawRow = Record<string, unknown>;

const DEFAULT_NOTIFICATION_DEFAULTS = {
  email: true,
  inApp: true,
  dueSoon: true,
  overdue: true,
  taskAssigned: true,
  taskStatusChanged: true,
};

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readNullableString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function readArrayOfNumbers(value: unknown, fallback: number[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.filter((item): item is number => typeof item === 'number');
}

function readArrayOfStrings(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function readTheme(value: unknown): ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function mapWorkspace(row: RawRow, settingsRow?: RawRow | null): Workspace {
  return {
    id: readString(row.id),
    slug: readString(row.slug),
    name: readString(row.name, 'FernFlow'),
    logoUrl: readNullableString(settingsRow?.logo_url ?? row.logo_url),
    timezone: readString(settingsRow?.timezone ?? row.timezone, 'Asia/Colombo'),
    businessDays: readArrayOfNumbers(settingsRow?.business_days, BUSINESS_DAY_OPTIONS),
    createdAt: readString(row.created_at, new Date().toISOString()),
  };
}

function mapUserSettings(row: RawRow | null, workspaceId: string): UserSettings {
  return {
    userId: readString(row?.user_id),
    workspaceId,
    timezone: readString(row?.timezone, 'Asia/Colombo'),
    theme: readTheme(row?.theme),
    emailNotifications: readBoolean(row?.email_notifications, true),
    inAppNotifications: readBoolean(row?.in_app_notifications, true),
    dailyDigest: readBoolean(row?.daily_digest, true),
  };
}

function mapProfile(row: RawRow, settings: UserSettings): UserProfile {
  const fullName = readString(row.full_name, 'FernFlow User');

  return {
    id: readString(row.id),
    email: readString(row.email),
    fullName,
    initials: getInitials(fullName),
    color: avatarColorForString(readString(row.id, fullName)),
    avatarUrl: readNullableString(row.avatar_url),
    title: readNullableString(row.title),
    timezone: readString(row.timezone, settings.timezone),
    theme: settings.theme,
  };
}

function mapWorkspaceSettings(row: RawRow | null, workspaceId: string): WorkspaceSettings {
  const defaults = row?.notification_defaults as Record<string, unknown> | undefined;

  return {
    workspaceId,
    logoUrl: readNullableString(row?.logo_url),
    timezone: readString(row?.timezone, 'Asia/Colombo'),
    businessDays: readArrayOfNumbers(row?.business_days, BUSINESS_DAY_OPTIONS),
    taskStatuses: readArrayOfStrings(
      row?.task_statuses,
      TASK_STATUS_OPTIONS
    ) as typeof TASK_STATUS_OPTIONS,
    notificationDefaults: {
      email: readBoolean(defaults?.email, true),
      inApp: readBoolean(defaults?.inApp, true),
      dueSoon: readBoolean(defaults?.dueSoon, true),
      overdue: readBoolean(defaults?.overdue, true),
      taskAssigned: readBoolean(defaults?.taskAssigned, true),
      taskStatusChanged: readBoolean(defaults?.taskStatusChanged, true),
    },
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
    metadata:
      row.metadata && typeof row.metadata === 'object'
        ? (row.metadata as Record<string, unknown>)
        : null,
    createdAt: readString(row.created_at),
    readAt: readNullableString(row.read_at),
  };
}

export interface AppContext {
  authUser: User;
  profile: UserProfile;
  userSettings: UserSettings;
  workspace: Workspace;
  availableWorkspaces: Workspace[];
  workspaceMember: WorkspaceMember;
  workspaceSettings: WorkspaceSettings;
  isAdmin: boolean;
}

async function ensureWorkspace(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const env = getServerEnv();
  const workspaceSlug = slugify(env.FERNFLOW_WORKSPACE_SLUG || env.FERNFLOW_WORKSPACE_NAME);

  const { data: existingWorkspace, error: selectError } = await admin
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingWorkspace) {
    return existingWorkspace as RawRow;
  }

  const { data: createdWorkspace, error: insertError } = await admin
    .from('workspaces')
    .insert({
      slug: workspaceSlug,
      name: env.FERNFLOW_WORKSPACE_NAME,
      timezone: 'Asia/Colombo',
    })
    .select('*')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return createdWorkspace as RawRow;
}

async function getUserWorkspaceMembership(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  workspaceId: string
) {
  const { data, error } = await admin
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as RawRow | null;
}

async function getUserWorkspaceMemberships(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string
) {
  const { data, error } = await admin
    .from('workspace_members')
    .select('*')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RawRow[];
}

async function getWorkspaceById(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  workspaceId: string
) {
  const { data, error } = await admin
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as RawRow | null;
}

async function getWorkspacesByIds(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  workspaceIds: string[]
) {
  if (workspaceIds.length === 0) {
    return [] as RawRow[];
  }

  const { data, error } = await admin
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RawRow[];
}

async function ensureWorkspaceSettings(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  workspaceId: string
) {
  const { data: existingSettings, error: selectError } = await admin
    .from('workspace_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingSettings) {
    return existingSettings as RawRow;
  }

  const { data: createdSettings, error: insertError } = await admin
    .from('workspace_settings')
    .upsert(
      {
        workspace_id: workspaceId,
        timezone: 'Asia/Colombo',
        business_days: BUSINESS_DAY_OPTIONS,
        task_statuses: TASK_STATUS_OPTIONS,
        notification_defaults: DEFAULT_NOTIFICATION_DEFAULTS,
      },
      { onConflict: 'workspace_id' }
    )
    .select('*')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return createdSettings as RawRow;
}

async function ensureProfile(admin: ReturnType<typeof createSupabaseAdminClient>, user: User) {
  const fullName =
    readString(user.user_metadata.full_name) ||
    readString(user.user_metadata.name) ||
    user.email?.split('@')[0] ||
    'FernFlow User';

  const { error } = await admin.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
      avatar_url: readNullableString(user.user_metadata.avatar_url),
      title: readNullableString(user.user_metadata.title),
      timezone: readString(user.user_metadata.timezone, 'Asia/Colombo'),
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(error.message);
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return profile as RawRow;
}

async function ensureUserSettings(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  workspaceId: string,
  profileRow: RawRow
) {
  const { data: existingSettings, error: selectError } = await admin
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingSettings) {
    return existingSettings as RawRow;
  }

  const { data: createdSettings, error: insertError } = await admin
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        workspace_id: workspaceId,
        timezone: readString(profileRow.timezone, 'Asia/Colombo'),
        theme: 'system',
        email_notifications: true,
        in_app_notifications: true,
        daily_digest: true,
      },
      { onConflict: 'user_id,workspace_id' }
    )
    .select('*')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return createdSettings as RawRow;
}

async function ensureWorkspaceMembership(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  user: User,
  workspaceId: string
) {
  const { data: existingMembership, error: membershipError } = await admin
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (existingMembership) {
    return existingMembership as RawRow;
  }

  const { count, error: countError } = await admin
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'active');

  if (countError) {
    throw new Error(countError.message);
  }

  const role: WorkspaceRole = count === 0 ? 'owner' : 'member';

  const { data: createdMembership, error: insertError } = await admin
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      user_id: user.id,
      role,
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return createdMembership as RawRow;
}

export async function getCurrentAuthUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getAppContext(requestedWorkspaceId?: string): Promise<AppContext | null> {
  try {
    const authUser = await getCurrentAuthUser();

    if (!authUser || !authUser.email) {
      return null;
    }

    const admin = createSupabaseAdminClient();
    const profileRow = await ensureProfile(admin, authUser);
    const defaultWorkspaceRow = await ensureWorkspace(admin);
    const defaultWorkspaceId = readString(defaultWorkspaceRow.id);
    await ensureWorkspaceMembership(admin, authUser, defaultWorkspaceId);

    const runtimeWorkspaceId =
      requestedWorkspaceId ?? (await resolveWorkspaceIdFromRuntimeContext());
    const memberships = await getUserWorkspaceMemberships(admin, authUser.id);

    let selectedMembership: RawRow | null = null;
    if (runtimeWorkspaceId) {
      selectedMembership = await getUserWorkspaceMembership(admin, authUser.id, runtimeWorkspaceId);
    }

    if (!selectedMembership) {
      selectedMembership =
        memberships.find((membership) => readString(membership.status, 'active') === 'active') ??
        memberships[0] ??
        null;
    }

    if (!selectedMembership) {
      return null;
    }

    const selectedWorkspaceId = readString(selectedMembership.workspace_id, defaultWorkspaceId);
    const workspaceIds = memberships
      .map((membership) => readString(membership.workspace_id))
      .filter(Boolean);
    const workspaceRows = await getWorkspacesByIds(admin, workspaceIds);
    const availableWorkspaces = workspaceRows.map((workspaceRow) => mapWorkspace(workspaceRow));
    const workspaceRow = await getWorkspaceById(admin, selectedWorkspaceId);

    if (!workspaceRow) {
      return null;
    }

    const workspaceSettingsRow = await ensureWorkspaceSettings(admin, selectedWorkspaceId);
    const userSettingsRow = await ensureUserSettings(
      admin,
      authUser.id,
      selectedWorkspaceId,
      profileRow
    );

    const workspace = mapWorkspace(workspaceRow, workspaceSettingsRow);
    const workspaceSettings = mapWorkspaceSettings(workspaceSettingsRow, workspace.id);
    const userSettings = mapUserSettings(userSettingsRow, workspace.id);
    const profile = mapProfile(profileRow, userSettings);
    const workspaceMember: WorkspaceMember = {
      id: readString(selectedMembership.id),
      workspaceId: workspace.id,
      userId: authUser.id,
      role: readString(selectedMembership.role, 'member') as WorkspaceRole,
      status: readString(selectedMembership.status, 'active') as WorkspaceMember['status'],
      joinedAt: readNullableString(selectedMembership.joined_at),
      invitedAt: readNullableString(selectedMembership.invited_at),
      profile,
    };

    return {
      authUser,
      profile,
      userSettings,
      workspace,
      availableWorkspaces,
      workspaceMember,
      workspaceSettings,
      isAdmin: workspaceMember.role === 'owner' || workspaceMember.role === 'admin',
    };
  } catch (error) {
    console.error('getAppContext error:', error);
    return null;
  }
}

export async function getAppShellData(): Promise<AppShellData | null> {
  const context = await getAppContext();

  if (!context) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data: notifications, error: notificationsError } = await admin
    .from('notifications')
    .select('*')
    .eq('workspace_id', context.workspace.id)
    .eq('user_id', context.authUser.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (notificationsError) {
    throw new Error(notificationsError.message);
  }

  const recentNotifications = (notifications ?? []).map((notification) =>
    mapNotification(notification as RawRow)
  );

  const currentUser: AppShellUser = {
    id: context.profile.id,
    fullName: context.profile.fullName,
    initials: context.profile.initials,
    color: context.profile.color,
    avatarUrl: context.profile.avatarUrl,
    title: context.profile.title,
    role: context.workspaceMember.role,
    timezone: context.userSettings.timezone,
    theme: context.userSettings.theme,
  };

  return {
    currentUser,
    workspace: context.workspace,
    availableWorkspaces: context.availableWorkspaces,
    unreadNotifications: recentNotifications.filter((notification) => !notification.isRead).length,
    recentNotifications,
    darkModeDefault: context.userSettings.theme,
  };
}

export function assertWorkspaceMember(context: AppContext) {
  if (context.workspaceMember.status !== 'active') {
    throw new Error('Your FernFlow membership is inactive.');
  }
}

export function assertAdmin(context: AppContext) {
  assertWorkspaceMember(context);

  if (!context.isAdmin) {
    throw new Error('You do not have permission to perform this action.');
  }
}
