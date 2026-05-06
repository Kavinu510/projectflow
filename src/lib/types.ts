export type WorkspaceRole = 'owner' | 'admin' | 'member';
export type MembershipStatus = 'active' | 'inactive' | 'invited';
export type ProjectStatus = 'Active' | 'Completed' | 'On Hold';
export type TaskStatus = 'To-Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ActivityTargetType =
  | 'project'
  | 'task'
  | 'member'
  | 'notification'
  | 'settings'
  | 'profile';
export type NotificationType =
  | 'task_assigned'
  | 'task_due_date_changed'
  | 'task_status_changed'
  | 'task_due_soon'
  | 'task_overdue'
  | 'member_invited'
  | 'member_role_changed'
  | 'workspace_updated'
  | 'profile_updated';

export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ['Active', 'On Hold', 'Completed'];
export const TASK_STATUS_OPTIONS: TaskStatus[] = ['To-Do', 'In Progress', 'Review', 'Done'];
export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ['High', 'Medium', 'Low'];
export const WORKSPACE_ROLE_OPTIONS: WorkspaceRole[] = ['owner', 'admin', 'member'];
export const BUSINESS_DAY_OPTIONS = [1, 2, 3, 4, 5];

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  color: string;
  avatarUrl: string | null;
  title: string | null;
  timezone: string;
  theme: ThemeMode;
}

export interface WorkspaceUserOption {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: WorkspaceRole;
  email?: string;
}

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  timezone: string;
  businessDays: number[];
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  status: MembershipStatus;
  joinedAt: string | null;
  invitedAt: string | null;
  profile: UserProfile;
}

export interface TeamMemberSummary extends WorkspaceMember {
  assignedTaskCount: number;
  activeProjectCount: number;
  recentActivityCount: number;
  projectIds: string[];
}

export interface Project {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  dueDate: string;
  teamIds: string[];
  taskCount: number;
  completedTaskCount: number;
  tags: string[];
  createdBy: string | null;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  actorId: string | null;
  action: string;
  targetType: ActivityTargetType;
  targetId: string | null;
  targetName: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
}

export interface WorkspaceSettings {
  workspaceId: string;
  logoUrl: string | null;
  timezone: string;
  businessDays: number[];
  taskStatuses: TaskStatus[];
  notificationDefaults: {
    email: boolean;
    inApp: boolean;
    dueSoon: boolean;
    overdue: boolean;
    taskAssigned: boolean;
    taskStatusChanged: boolean;
  };
}

export interface UserSettings {
  userId: string;
  workspaceId: string;
  timezone: string;
  theme: ThemeMode;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  dailyDigest: boolean;
}

export interface DashboardMetrics {
  activeProjects: number;
  dueTodayTasks: number;
  overdueTasks: number;
  teamCount: number;
  completionRate: number;
  reviewTasks: number;
  completedLast7Days: number;
  createdLast7Days: number;
}

export interface DashboardPayload {
  metrics: DashboardMetrics;
  activity: ActivityLog[];
  topProjects: Project[];
  myTasks: Task[];
  members: UserProfile[];
  trendData: Array<{ day: string; completed: number; added: number }>;
  tasksByProjectData: Array<{ project: string; open: number; done: number }>;
}

export interface TeamPageData {
  members: TeamMemberSummary[];
  projects: Project[];
  tasks: Task[];
  activity: ActivityLog[];
}

export interface ProfilePageData {
  profile: UserProfile;
  settings: UserSettings;
  assignedTasks: Task[];
  recentActivity: ActivityLog[];
}

export interface SettingsPageData {
  profile: UserProfile;
  userSettings: UserSettings;
  workspace: Workspace;
  workspaceSettings: WorkspaceSettings;
  isAdmin: boolean;
}

export interface AppShellUser {
  id: string;
  fullName: string;
  initials: string;
  color: string;
  avatarUrl: string | null;
  title: string | null;
  role: WorkspaceRole;
  timezone: string;
  theme: ThemeMode;
}

export interface AppShellData {
  currentUser: AppShellUser;
  workspace: Workspace;
  availableWorkspaces: Workspace[];
  unreadNotifications: number;
  recentNotifications: Notification[];
  darkModeDefault: ThemeMode;
}

export interface ProjectInput {
  title: string;
  description: string;
  status: ProjectStatus;
  dueDate: string;
  teamIds: string[];
  tags: string[];
}

export interface TaskInput {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export interface TeamInviteInput {
  email: string;
  fullName: string;
  role: WorkspaceRole;
  title?: string;
}

export interface TeamMemberUpdateInput {
  role?: WorkspaceRole;
  status?: MembershipStatus;
  projectIds?: string[];
}

export interface ProfileUpdateInput {
  fullName: string;
  title: string;
  avatarUrl: string | null;
  timezone: string;
  theme: ThemeMode;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  dailyDigest: boolean;
}

export interface WorkspaceSettingsInput {
  name: string;
  logoUrl: string | null;
  timezone: string;
  businessDays: number[];
  taskStatuses: TaskStatus[];
  notificationDefaults: WorkspaceSettings['notificationDefaults'];
}
