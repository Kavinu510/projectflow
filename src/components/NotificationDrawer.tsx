'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bell, CheckCheck, Circle, X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { type Notification } from '@/lib/types';

interface NotificationDrawerProps {
  open: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (notificationId: string, isRead: boolean) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
}

export default function NotificationDrawer({
  open,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationDrawerProps) {
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const visibleNotifications = useMemo(() => {
    return tab === 'all'
      ? notifications
      : notifications.filter((notification) => !notification.isRead);
  }, [notifications, tab]);

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-2xl dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              Stay on top of assignments, reminders, and team activity.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex rounded-xl bg-muted p-1 text-sm">
            <button
              type="button"
              onClick={() => setTab('all')}
              className={`rounded-lg px-3 py-1.5 ${
                tab === 'all'
                  ? 'bg-white font-medium text-foreground shadow-sm dark:bg-slate-900'
                  : 'text-muted-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTab('unread')}
              className={`rounded-lg px-3 py-1.5 ${
                tab === 'unread'
                  ? 'bg-white font-medium text-foreground shadow-sm dark:bg-slate-900'
                  : 'text-muted-foreground'
              }`}
            >
              Unread
            </button>
          </div>

          <button
            type="button"
            onClick={() => void onMarkAllRead()}
            className="text-xs font-semibold text-indigo-600 transition hover:underline"
          >
            Mark all read
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {visibleNotifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <Bell size={36} className="mb-3 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No notifications here yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New assignments, reminders, and workspace updates will show up here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleNotifications.map((notification) => (
                <div key={notification.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => void onMarkRead(notification.id, !notification.isRead)}
                      className="mt-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {notification.isRead ? (
                        <CheckCheck size={16} />
                      ) : (
                        <Circle size={16} className="fill-indigo-500 text-indigo-500" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                        </div>
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="mt-3 inline-flex text-xs font-semibold text-indigo-600 transition hover:underline"
                        >
                          Open related item
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          <Link
            href="/notifications"
            className="text-sm font-semibold text-indigo-600 transition hover:underline"
          >
            Open full notifications page
          </Link>
        </div>
      </aside>
    </>
  );
}
