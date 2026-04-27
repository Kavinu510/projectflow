'use client';

import React, { useState } from 'react';
import { type ProfilePageData, type ProfileUpdateInput } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function ProfileClient({ initialData }: { initialData: ProfilePageData }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit } = useForm<ProfileUpdateInput>({
    defaultValues: {
      fullName: initialData.profile.fullName,
      title: initialData.profile.title ?? '',
      avatarUrl: initialData.profile.avatarUrl,
      timezone: initialData.profile.timezone,
      theme: initialData.profile.theme,
      emailNotifications: initialData.settings.emailNotifications,
      inAppNotifications: initialData.settings.inAppNotifications,
      dailyDigest: initialData.settings.dailyDigest,
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Profile updated successfully');
      router.refresh();
    } catch (_error) {
      toast.error('Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/auth/signout', { method: 'POST' });
      router.push('/login');
    } catch (_error) {
      toast.error('Sign out failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">My Profile</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal details and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Personal Information</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    {...register('fullName', { required: true })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    {...register('title')}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Avatar URL</label>
                  <input
                    type="text"
                    {...register('avatarUrl')}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select
                    {...register('timezone')}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Colombo">Colombo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Theme</label>
                  <select
                    {...register('theme')}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-4 pt-4 border-t border-border">
                Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('emailNotifications')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">Email Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('inAppNotifications')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">In-App Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('dailyDigest')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">Daily Digest</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-red-700 dark:text-red-400 mb-2">
              Authentication
            </h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
              Sign out of your account on this device.
            </p>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 dark:bg-red-950 dark:border-red-900 dark:hover:bg-red-900 rounded-lg flex items-center gap-2"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Task Summary</h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 text-center">
              <span className="block text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {initialData.assignedTasks.length}
              </span>
              <span className="text-xs font-medium text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-wider">
                Assigned Tasks
              </span>
            </div>
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
              {initialData.assignedTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="text-sm p-2 rounded bg-muted/50 truncate">
                  {task.title}
                </div>
              ))}
              {initialData.assignedTasks.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No tasks assigned
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Recent Activity</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-1">
              {initialData.recentActivity.map((activity) => (
                <div key={activity.id} className="text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">{activity.action}</span> {activity.targetName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              ))}
              {initialData.recentActivity.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
