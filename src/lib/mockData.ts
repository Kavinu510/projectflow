export type UserRole = 'Admin' | 'Member';
export type ProjectStatus = 'Active' | 'Completed' | 'On Hold';
export type TaskStatus = 'To-Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  email: string;
  initials: string;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  createdDate: string;
  dueDate: string;
  teamIds: string[];
  taskCount: number;
  completedTaskCount: number;
  tags: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdDate: string;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  action: string;
  target: string;
  targetType: 'task' | 'project' | 'comment';
  projectId?: string;
  timestamp: string;
}

export const USERS: User[] = [
  {
    id: 'user-001',
    name: 'Priya Sharma',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    role: 'Admin',
    email: 'priya.sharma@projectflow.io',
    initials: 'PS',
    color: '#4F46E5',
  },
  {
    id: 'user-002',
    name: 'Marcus Chen',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    role: 'Member',
    email: 'marcus.chen@projectflow.io',
    initials: 'MC',
    color: '#0D9488',
  },
  {
    id: 'user-003',
    name: 'Aisha Okonkwo',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
    role: 'Member',
    email: 'aisha.okonkwo@projectflow.io',
    initials: 'AO',
    color: '#7C3AED',
  },
  {
    id: 'user-004',
    name: 'Daniel Torres',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel',
    role: 'Member',
    email: 'daniel.torres@projectflow.io',
    initials: 'DT',
    color: '#DB2777',
  },
  {
    id: 'user-005',
    name: 'Sophie Leclerc',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
    role: 'Member',
    email: 'sophie.leclerc@projectflow.io',
    initials: 'SL',
    color: '#D97706',
  },
  {
    id: 'user-006',
    name: 'Rohan Mehta',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohan',
    role: 'Member',
    email: 'rohan.mehta@projectflow.io',
    initials: 'RM',
    color: '#059669',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'proj-001',
    title: 'Mobile App Redesign',
    description:
      'Complete overhaul of the iOS and Android apps with new design system, improved onboarding flow, and performance optimizations.',
    status: 'Active',
    progress: 68,
    createdDate: '2026-02-10',
    dueDate: '2026-05-15',
    teamIds: ['user-001', 'user-002', 'user-003'],
    taskCount: 22,
    completedTaskCount: 15,
    tags: ['Design', 'Mobile', 'UX'],
  },
  {
    id: 'proj-002',
    title: 'API Migration v2',
    description:
      'Migrate legacy REST endpoints to GraphQL. Includes schema design, resolver implementation, and deprecation of v1 endpoints.',
    status: 'Active',
    progress: 41,
    createdDate: '2026-03-01',
    dueDate: '2026-05-30',
    teamIds: ['user-002', 'user-006'],
    taskCount: 18,
    completedTaskCount: 7,
    tags: ['Backend', 'API', 'Infrastructure'],
  },
  {
    id: 'proj-003',
    title: 'Q2 Marketing Campaign',
    description:
      'Multi-channel campaign across email, social, and paid ads targeting SMB segment. Includes landing page redesign and A/B testing.',
    status: 'Active',
    progress: 55,
    createdDate: '2026-03-15',
    dueDate: '2026-04-30',
    teamIds: ['user-004', 'user-005'],
    taskCount: 14,
    completedTaskCount: 8,
    tags: ['Marketing', 'Growth'],
  },
  {
    id: 'proj-004',
    title: 'Data Warehouse Setup',
    description:
      'Provision Snowflake environment, build dbt models for core business metrics, and connect BI tooling for executive dashboards.',
    status: 'On Hold',
    progress: 22,
    createdDate: '2026-01-20',
    dueDate: '2026-06-30',
    teamIds: ['user-006', 'user-001'],
    taskCount: 16,
    completedTaskCount: 4,
    tags: ['Data', 'Infrastructure'],
  },
  {
    id: 'proj-005',
    title: 'Customer Portal v3',
    description:
      'Self-service portal allowing customers to manage subscriptions, download invoices, and submit support tickets without contacting sales.',
    status: 'Active',
    progress: 83,
    createdDate: '2026-01-05',
    dueDate: '2026-04-25',
    teamIds: ['user-001', 'user-003', 'user-004'],
    taskCount: 20,
    completedTaskCount: 17,
    tags: ['Product', 'Frontend'],
  },
  {
    id: 'proj-006',
    title: 'SOC 2 Compliance Audit',
    description:
      'Prepare documentation, implement controls, and coordinate with external auditors for SOC 2 Type II certification.',
    status: 'Active',
    progress: 30,
    createdDate: '2026-02-28',
    dueDate: '2026-07-01',
    teamIds: ['user-001', 'user-002', 'user-006'],
    taskCount: 25,
    completedTaskCount: 8,
    tags: ['Security', 'Compliance'],
  },
  {
    id: 'proj-007',
    title: 'Design System v2',
    description:
      'Build a comprehensive component library in Figma and React, covering all atomic components, patterns, and documentation site.',
    status: 'Completed',
    progress: 100,
    createdDate: '2025-11-01',
    dueDate: '2026-02-28',
    teamIds: ['user-003', 'user-005'],
    taskCount: 30,
    completedTaskCount: 30,
    tags: ['Design', 'Frontend'],
  },
  {
    id: 'proj-008',
    title: 'Onboarding Flow Optimization',
    description:
      'Reduce time-to-value for new users by redesigning the onboarding wizard, adding interactive tooltips, and improving empty states.',
    status: 'Active',
    progress: 15,
    createdDate: '2026-04-01',
    dueDate: '2026-06-15',
    teamIds: ['user-002', 'user-003', 'user-004'],
    taskCount: 12,
    completedTaskCount: 2,
    tags: ['Product', 'Growth', 'UX'],
  },
];

export const TASKS: Task[] = [
  // Mobile App Redesign
  {
    id: 'task-001',
    projectId: 'proj-001',
    title: 'Audit existing component library',
    description: 'Document all existing components and identify gaps vs new design spec.',
    assigneeId: 'user-003',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-04-10',
    createdDate: '2026-02-12',
  },
  {
    id: 'task-002',
    projectId: 'proj-001',
    title: 'Redesign onboarding screens',
    description: 'New onboarding flow with 3-step wizard and progress indicator.',
    assigneeId: 'user-002',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-04-28',
    createdDate: '2026-02-15',
  },
  {
    id: 'task-003',
    projectId: 'proj-001',
    title: 'Implement dark mode tokens',
    description: 'Add dark mode CSS variables and test across all screens.',
    assigneeId: 'user-003',
    status: 'Review',
    priority: 'Medium',
    dueDate: '2026-04-22',
    createdDate: '2026-03-01',
  },
  {
    id: 'task-004',
    projectId: 'proj-001',
    title: 'Performance profiling on Android',
    description: 'Profile startup time and jank on mid-range Android devices.',
    assigneeId: 'user-002',
    status: 'To-Do',
    priority: 'Medium',
    dueDate: '2026-05-05',
    createdDate: '2026-03-10',
  },
  {
    id: 'task-005',
    projectId: 'proj-001',
    title: 'Accessibility audit — WCAG 2.1 AA',
    description: 'Run full accessibility audit and fix critical violations.',
    assigneeId: 'user-001',
    status: 'To-Do',
    priority: 'High',
    dueDate: '2026-05-12',
    createdDate: '2026-03-15',
  },
  // API Migration
  {
    id: 'task-006',
    projectId: 'proj-002',
    title: 'Design GraphQL schema for Users',
    description: 'Define queries, mutations, and subscriptions for the User domain.',
    assigneeId: 'user-002',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-03-20',
    createdDate: '2026-03-03',
  },
  {
    id: 'task-007',
    projectId: 'proj-002',
    title: 'Implement resolver — Projects',
    description: 'Write and test all resolvers for Project queries and mutations.',
    assigneeId: 'user-006',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-04-25',
    createdDate: '2026-03-10',
  },
  {
    id: 'task-008',
    projectId: 'proj-002',
    title: 'Write migration guide for v1 deprecation',
    description: 'Document breaking changes and provide code examples for migrating.',
    assigneeId: 'user-002',
    status: 'To-Do',
    priority: 'Low',
    dueDate: '2026-05-20',
    createdDate: '2026-03-20',
  },
  {
    id: 'task-009',
    projectId: 'proj-002',
    title: 'Set up Apollo Server in staging',
    description: 'Configure Apollo Server with DataLoader and caching layers.',
    assigneeId: 'user-006',
    status: 'Review',
    priority: 'High',
    dueDate: '2026-04-18',
    createdDate: '2026-03-05',
  },
  // Q2 Marketing
  {
    id: 'task-010',
    projectId: 'proj-003',
    title: 'Write email sequence — nurture (5 emails)',
    description: 'Draft and review 5-email nurture sequence for SMB trial users.',
    assigneeId: 'user-005',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-04-05',
    createdDate: '2026-03-16',
  },
  {
    id: 'task-011',
    projectId: 'proj-003',
    title: 'Design landing page for campaign',
    description: 'New landing page with hero, social proof, and CTA above the fold.',
    assigneeId: 'user-004',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-04-22',
    createdDate: '2026-03-18',
  },
  {
    id: 'task-012',
    projectId: 'proj-003',
    title: 'Set up A/B test on CTA copy',
    description: 'Configure Optimizely test for two CTA variants on the landing page.',
    assigneeId: 'user-004',
    status: 'To-Do',
    priority: 'Medium',
    dueDate: '2026-04-28',
    createdDate: '2026-03-25',
  },
  // Customer Portal
  {
    id: 'task-013',
    projectId: 'proj-005',
    title: 'Implement subscription management UI',
    description: 'Allow customers to upgrade, downgrade, or cancel their plan.',
    assigneeId: 'user-001',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-04-10',
    createdDate: '2026-01-08',
  },
  {
    id: 'task-014',
    projectId: 'proj-005',
    title: 'Invoice download — PDF generation',
    description: 'Generate and serve PDF invoices via a signed URL.',
    assigneeId: 'user-004',
    status: 'Review',
    priority: 'Medium',
    dueDate: '2026-04-20',
    createdDate: '2026-01-15',
  },
  {
    id: 'task-015',
    projectId: 'proj-005',
    title: 'Support ticket submission form',
    description: 'Integrate Zendesk API to allow ticket creation from the portal.',
    assigneeId: 'user-003',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-04-24',
    createdDate: '2026-02-01',
  },
  // SOC 2
  {
    id: 'task-016',
    projectId: 'proj-006',
    title: 'Document access control policies',
    description: 'Write formal policy for role-based access and privileged access management.',
    assigneeId: 'user-001',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-04-19',
    createdDate: '2026-03-01',
  },
  {
    id: 'task-017',
    projectId: 'proj-006',
    title: 'Enable audit logging on production DB',
    description: 'Configure PostgreSQL audit extension and ship logs to SIEM.',
    assigneeId: 'user-006',
    status: 'To-Do',
    priority: 'High',
    dueDate: '2026-04-30',
    createdDate: '2026-03-05',
  },
  {
    id: 'task-018',
    projectId: 'proj-006',
    title: 'Vendor risk assessment — 12 vendors',
    description: 'Complete security questionnaire and risk scoring for all critical vendors.',
    assigneeId: 'user-002',
    status: 'To-Do',
    priority: 'Medium',
    dueDate: '2026-05-15',
    createdDate: '2026-03-10',
  },
  // Onboarding
  {
    id: 'task-019',
    projectId: 'proj-008',
    title: 'User research — 5 onboarding interviews',
    description: 'Conduct and synthesize interviews with recent signups to identify friction.',
    assigneeId: 'user-003',
    status: 'Done',
    priority: 'High',
    dueDate: '2026-04-15',
    createdDate: '2026-04-02',
  },
  {
    id: 'task-020',
    projectId: 'proj-008',
    title: 'Wireframe new onboarding wizard',
    description: 'Low-fidelity wireframes for the new 4-step onboarding wizard.',
    assigneeId: 'user-004',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-04-26',
    createdDate: '2026-04-05',
  },
  {
    id: 'task-021',
    projectId: 'proj-008',
    title: 'Define success metrics for new flow',
    description: 'Set up Mixpanel events and define the North Star for onboarding.',
    assigneeId: 'user-002',
    status: 'To-Do',
    priority: 'Medium',
    dueDate: '2026-05-01',
    createdDate: '2026-04-06',
  },
  {
    id: 'task-022',
    projectId: 'proj-001',
    title: 'Create icon set for new nav',
    description: 'Design 24 custom icons for the redesigned navigation system.',
    assigneeId: 'user-003',
    status: 'Done',
    priority: 'Low',
    dueDate: '2026-04-08',
    createdDate: '2026-02-20',
  },
  {
    id: 'task-023',
    projectId: 'proj-002',
    title: 'Rate limiting on GraphQL endpoints',
    description: 'Implement token-bucket rate limiting to prevent abuse.',
    assigneeId: 'user-006',
    status: 'To-Do',
    priority: 'Medium',
    dueDate: '2026-05-10',
    createdDate: '2026-03-22',
  },
  {
    id: 'task-024',
    projectId: 'proj-005',
    title: 'SSO integration — Okta',
    description: 'Add SAML 2.0 SSO support via Okta for enterprise customers.',
    assigneeId: 'user-006',
    status: 'To-Do',
    priority: 'High',
    dueDate: '2026-04-21',
    createdDate: '2026-02-10',
  },
  {
    id: 'task-025',
    projectId: 'proj-003',
    title: 'Schedule LinkedIn ad campaign',
    description: 'Upload creatives, set targeting, and schedule Q2 LinkedIn campaign.',
    assigneeId: 'user-005',
    status: 'Done',
    priority: 'Medium',
    dueDate: '2026-04-12',
    createdDate: '2026-03-20',
  },
];

export const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'evt-001',
    userId: 'user-003',
    action: 'moved',
    target: 'Audit existing component library',
    targetType: 'task',
    projectId: 'proj-001',
    timestamp: '2026-04-22T01:12:00Z',
  },
  {
    id: 'evt-002',
    userId: 'user-002',
    action: 'started',
    target: 'Redesign onboarding screens',
    targetType: 'task',
    projectId: 'proj-001',
    timestamp: '2026-04-22T00:45:00Z',
  },
  {
    id: 'evt-003',
    userId: 'user-006',
    action: 'submitted for review',
    target: 'Set up Apollo Server in staging',
    targetType: 'task',
    projectId: 'proj-002',
    timestamp: '2026-04-21T23:30:00Z',
  },
  {
    id: 'evt-004',
    userId: 'user-001',
    action: 'created project',
    target: 'Onboarding Flow Optimization',
    targetType: 'project',
    projectId: 'proj-008',
    timestamp: '2026-04-21T21:00:00Z',
  },
  {
    id: 'evt-005',
    userId: 'user-004',
    action: 'started',
    target: 'Design landing page for campaign',
    targetType: 'task',
    projectId: 'proj-003',
    timestamp: '2026-04-21T18:22:00Z',
  },
  {
    id: 'evt-006',
    userId: 'user-005',
    action: 'completed',
    target: 'Schedule LinkedIn ad campaign',
    targetType: 'task',
    projectId: 'proj-003',
    timestamp: '2026-04-21T16:10:00Z',
  },
  {
    id: 'evt-007',
    userId: 'user-003',
    action: 'completed',
    target: 'User research — 5 onboarding interviews',
    targetType: 'task',
    projectId: 'proj-008',
    timestamp: '2026-04-21T14:55:00Z',
  },
  {
    id: 'evt-008',
    userId: 'user-001',
    action: 'updated',
    target: 'SOC 2 Compliance Audit',
    targetType: 'project',
    projectId: 'proj-006',
    timestamp: '2026-04-21T11:30:00Z',
  },
];

export const TASK_COMPLETION_TREND = [
  { day: 'Apr 16', completed: 3, added: 5 },
  { day: 'Apr 17', completed: 7, added: 4 },
  { day: 'Apr 18', completed: 4, added: 6 },
  { day: 'Apr 19', completed: 9, added: 3 },
  { day: 'Apr 20', completed: 5, added: 7 },
  { day: 'Apr 21', completed: 11, added: 2 },
  { day: 'Apr 22', completed: 6, added: 4 },
];

export const TASKS_BY_PROJECT_DATA = [
  { project: 'Mobile App', open: 7, done: 15 },
  { project: 'API Migration', open: 11, done: 7 },
  { project: 'Q2 Campaign', open: 6, done: 8 },
  { project: 'Customer Portal', open: 3, done: 17 },
  { project: 'SOC 2 Audit', open: 17, done: 8 },
  { project: 'Onboarding', open: 10, done: 2 },
];