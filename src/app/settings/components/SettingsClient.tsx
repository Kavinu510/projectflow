'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { Bell, BriefcaseBusiness, Loader2, Save, Shield, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  TASK_STATUS_OPTIONS,
  type ProfileUpdateInput,
  type SettingsPageData,
  type WorkspaceSettingsInput,
} from '@/lib/types';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

function nullableUrl(value: string | null) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export default function SettingsClient({ initialData }: { initialData: SettingsPageData }) {
  const router = useRouter();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  const profileForm = useForm<ProfileUpdateInput>({
    defaultValues: {
      fullName: initialData.profile.fullName,
      title: initialData.profile.title ?? '',
      avatarUrl: initialData.profile.avatarUrl ?? '',
      timezone: initialData.profile.timezone,
      theme: initialData.profile.theme,
      emailNotifications: initialData.userSettings.emailNotifications,
      inAppNotifications: initialData.userSettings.inAppNotifications,
      dailyDigest: initialData.userSettings.dailyDigest,
    },
  });

  const workspaceForm = useForm<WorkspaceSettingsInput>({
    defaultValues: {
      name: initialData.workspace.name,
      logoUrl: initialData.workspaceSettings.logoUrl ?? '',
      timezone: initialData.workspaceSettings.timezone,
      businessDays: initialData.workspaceSettings.businessDays,
      taskStatuses: initialData.workspaceSettings.taskStatuses,
      notificationDefaults: initialData.workspaceSettings.notificationDefaults,
    },
  });

  const onProfileSubmit = async (data: ProfileUpdateInput) => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, avatarUrl: nullableUrl(data.avatarUrl) }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Personal settings updated');
      router.refresh();
    } catch (_error) {
      toast.error('Could not update personal settings');
    } finally {
      setSavingProfile(false);
    }
  };

  const onWorkspaceSubmit = async (data: WorkspaceSettingsInput) => {
    setSavingWorkspace(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, logoUrl: nullableUrl(data.logoUrl) }),
      });

      if (!res.ok) {
        throw new Error('Failed to update workspace settings');
      }

      toast.success('Workspace settings updated');
      router.refresh();
    } catch (_error) {
      toast.error('Could not update workspace settings');
    } finally {
      setSavingWorkspace(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account preferences and workspace defaults.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-muted-foreground dark:bg-gray-900">
          <Shield size={14} />
          {initialData.isAdmin ? 'Admin access' : 'Member access'}
        </div>
      </div>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-5 flex items-center gap-3">
          <UserRound size={18} className="text-indigo-600" />
          <div>
            <h3 className="text-base font-semibold text-foreground">Personal Settings</h3>
            <p className="text-sm text-muted-foreground">
              Profile, theme, and notification preferences.
            </p>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full Name">
              <input
                type="text"
                {...profileForm.register('fullName', { required: true })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </Field>
            <Field label="Job Title">
              <input
                type="text"
                {...profileForm.register('title')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </Field>
            <Field label="Avatar URL">
              <input
                type="url"
                {...profileForm.register('avatarUrl')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </Field>
            <Field label="Timezone">
              <TimezoneSelect register={profileForm.register('timezone')} />
            </Field>
            <Field label="Theme">
              <select
                {...profileForm.register('theme')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </Field>
          </div>

          <div className="border-t border-border pt-5">
            <div className="mb-3 flex items-center gap-2">
              <Bell size={16} className="text-indigo-600" />
              <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Checkbox label="Email" register={profileForm.register('emailNotifications')} />
              <Checkbox label="In-app" register={profileForm.register('inAppNotifications')} />
              <Checkbox label="Daily digest" register={profileForm.register('dailyDigest')} />
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-5">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Personal Settings
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-border bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness size={18} className="text-indigo-600" />
            <div>
              <h3 className="text-base font-semibold text-foreground">Workspace Settings</h3>
              <p className="text-sm text-muted-foreground">
                Workspace identity, task workflow, business days, and team defaults.
              </p>
            </div>
          </div>
          {!initialData.isAdmin && (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Read only
            </span>
          )}
        </div>

        <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-5">
          <fieldset
            disabled={!initialData.isAdmin || savingWorkspace}
            className="space-y-5 disabled:opacity-70"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Workspace Name">
                <input
                  type="text"
                  {...workspaceForm.register('name', { required: true })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </Field>
              <Field label="Logo URL">
                <input
                  type="url"
                  {...workspaceForm.register('logoUrl')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </Field>
              <Field label="Workspace Timezone">
                <TimezoneSelect register={workspaceForm.register('timezone')} />
              </Field>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Business Days
              </label>
              <Controller
                name="businessDays"
                control={workspaceForm.control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => {
                      const isSelected = field.value.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const nextValue = isSelected
                              ? field.value.filter((value) => value !== day.value)
                              : [...field.value, day.value];
                            field.onChange(nextValue);
                          }}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-border bg-background text-foreground hover:border-indigo-400'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Task Statuses
              </label>
              <Controller
                name="taskStatuses"
                control={workspaceForm.control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {TASK_STATUS_OPTIONS.map((status) => {
                      const isSelected = field.value.includes(status);
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            const nextValue = isSelected
                              ? field.value.filter((value) => value !== status)
                              : [...field.value, status];
                            field.onChange(nextValue);
                          }}
                          className={`min-h-10 rounded-lg border px-3 text-sm font-medium transition ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200'
                              : 'border-border bg-background text-foreground hover:border-indigo-400'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className="border-t border-border pt-5">
              <div className="mb-3 flex items-center gap-2">
                <Bell size={16} className="text-indigo-600" />
                <h4 className="text-sm font-semibold text-foreground">Default Notifications</h4>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Checkbox
                  label="Email"
                  register={workspaceForm.register('notificationDefaults.email')}
                />
                <Checkbox
                  label="In-app"
                  register={workspaceForm.register('notificationDefaults.inApp')}
                />
                <Checkbox
                  label="Due soon alerts"
                  register={workspaceForm.register('notificationDefaults.dueSoon')}
                />
                <Checkbox
                  label="Overdue alerts"
                  register={workspaceForm.register('notificationDefaults.overdue')}
                />
                <Checkbox
                  label="Task assigned"
                  register={workspaceForm.register('notificationDefaults.taskAssigned')}
                />
                <Checkbox
                  label="Task status changed"
                  register={workspaceForm.register('notificationDefaults.taskStatusChanged')}
                />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end border-t border-border pt-5">
            <button
              type="submit"
              disabled={!initialData.isAdmin || savingWorkspace}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingWorkspace ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save Workspace Settings
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function TimezoneSelect({
  register,
}: {
  register: ReturnType<ReturnType<typeof useForm>['register']>;
}) {
  return (
    <select
      {...register}
      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
    >
      <option value="America/New_York">Eastern Time</option>
      <option value="America/Los_Angeles">Pacific Time</option>
      <option value="Europe/London">London</option>
      <option value="Asia/Colombo">Colombo</option>
    </select>
  );
}

function Checkbox({
  label,
  register,
}: {
  label: string;
  register: ReturnType<ReturnType<typeof useForm>['register']>;
}) {
  return (
    <label className="flex min-h-10 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
      <input type="checkbox" {...register} className="h-4 w-4 rounded accent-indigo-600" />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}
