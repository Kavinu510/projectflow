'use client';

import React, { useState } from 'react';
import { type Notification } from '@/lib/types';
import { toast } from 'sonner';
import { Bell, Check, CheckCheck, Inbox, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function NotificationsClient({ initialData }: { initialData: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialData);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  const markAsRead = async (id: string, isRead: boolean) => {
    const prev = [...notifications];
    setNotifications(prev.map((n) => (n.id === id ? { ...n, isRead } : n)));
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch (_error) {
      setNotifications(prev);
      toast.error('Could not update notification');
    }
  };

  const markAllAsRead = async () => {
    const prev = [...notifications];
    setNotifications(prev.map((n) => ({ ...n, isRead: true })));
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      toast.success('All marked as read');
    } catch (_error) {
      setNotifications(prev);
      toast.error('Could not update notifications');
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_due_soon':
      case 'task_overdue':
        return <AlertCircle className="text-red-500" size={18} />;
      case 'task_assigned':
      case 'task_status_changed':
        return <Check className="text-indigo-500" size={18} />;
      case 'member_invited':
      case 'member_role_changed':
        return <Info className="text-blue-500" size={18} />;
      default:
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay updated on your tasks and team activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-muted rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white dark:bg-gray-800 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'unread'
                  ? 'bg-white dark:bg-gray-800 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread
            </button>
          </div>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-white dark:bg-gray-900 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <Inbox className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 ${
                  !notification.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          className="font-medium text-sm text-foreground hover:text-indigo-600 transition-colors"
                        >
                          {notification.title}
                        </Link>
                      ) : (
                        <h4 className="font-medium text-sm text-foreground">
                          {notification.title}
                        </h4>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                      <button
                        onClick={() => markAsRead(notification.id, !notification.isRead)}
                        className={`p-1.5 rounded-full border transition-colors ${
                          notification.isRead
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'border-border bg-white text-muted-foreground hover:text-indigo-600 hover:border-indigo-200 dark:bg-gray-800'
                        }`}
                        title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
