'use client';

import React, { useState } from 'react';
import { type SettingsPageData, type WorkspaceSettingsInput } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsClient({ initialData }: { initialData: SettingsPageData }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors: _errors },
  } = useForm<WorkspaceSettingsInput>({
    defaultValues: {
      name: initialData.workspace.name,
      logoUrl: initialData.workspaceSettings.logoUrl,
      timezone: initialData.workspaceSettings.timezone,
      businessDays: initialData.workspaceSettings.businessDays,
      taskStatuses: initialData.workspaceSettings.taskStatuses,
      notificationDefaults: initialData.workspaceSettings.notificationDefaults,
    },
  });

  const onSubmit = async (data: WorkspaceSettingsInput) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      toast.success('Workspace settings updated');
      router.refresh();
    } catch (_error) {
      toast.error('Could not update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const DAYS = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage workspace details, defaults, and preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                General
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Workspace Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { required: true })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <input
                  type="text"
                  {...register('logoUrl')}
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
                <label className="block text-sm font-medium mb-2">Business Days</label>
                <Controller
                  name="businessDays"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => {
                        const isSelected = field.value.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              const newValue = isSelected
                                ? field.value.filter((d) => d !== day.value)
                                : [...field.value, day.value];
                              field.onChange(newValue);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white dark:bg-gray-800 text-foreground border-border hover:border-indigo-400'
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Notification Defaults
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                Default settings for new team members.
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('notificationDefaults.email')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">Email Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('notificationDefaults.inApp')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">In-App Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('notificationDefaults.dueSoon')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">Due Soon Alerts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('notificationDefaults.overdue')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">Overdue Alerts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('notificationDefaults.taskAssigned')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">Task Assigned</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('notificationDefaults.taskStatusChanged')}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm">Task Status Changed</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
