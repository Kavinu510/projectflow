'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import NotificationDrawer from '@/components/NotificationDrawer';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { type AppShellData, type Notification } from '@/lib/types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  shell: AppShellData;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function AppLayout({
  children,
  currentPath,
  shell,
  pageTitle = '',
  pageSubtitle = '',
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(shell.darkModeDefault === 'dark');
  const [notifications, setNotifications] = useState<Notification[]>(shell.recentNotifications);
  const [unreadCount, setUnreadCount] = useState(shell.unreadNotifications);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('fernflow-theme');
    const shouldUseDark =
      storedTheme === 'dark' ||
      (!storedTheme &&
        shell.darkModeDefault === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', shouldUseDark);
    setDarkMode(shouldUseDark);
  }, [shell.darkModeDefault]);

  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${shell.currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${shell.currentUser.id}`,
        },
        () => {
          void refreshNotifications();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [shell.currentUser.id, supabase]);

  const refreshNotifications = async () => {
    const response = await fetch('/api/notifications', { cache: 'no-store' });
    const data = (await response.json()) as { notifications: Notification[] };
    setNotifications(data.notifications);
    setUnreadCount(data.notifications.filter((notification) => !notification.isRead).length);
  };

  const handleToggleDark = () => {
    setDarkMode((previous) => {
      const next = !previous;
      document.documentElement.classList.toggle('dark', next);
      window.localStorage.setItem('fernflow-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleMarkNotification = async (notificationId: string, isRead: boolean) => {
    await fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead }),
    });
    await refreshNotifications();
  };

  const handleMarkAllNotifications = async () => {
    await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
    });
    await refreshNotifications();
  };

  const openNotifications = async () => {
    setNotificationsOpen(true);
    await refreshNotifications();
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        currentPath={currentPath}
        currentUser={shell.currentUser}
        isAdmin={shell.currentUser.role === 'owner' || shell.currentUser.role === 'admin'}
        onToggleCollapse={() => setSidebarCollapsed((previous) => !previous)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          title={pageTitle}
          subtitle={pageSubtitle}
          currentUser={shell.currentUser}
          isAdmin={shell.currentUser.role === 'owner' || shell.currentUser.role === 'admin'}
          unreadCount={unreadCount}
          darkMode={darkMode}
          onOpenNotifications={() => void openNotifications()}
          onMobileMenuToggle={() => setMobileSidebarOpen((previous) => !previous)}
          onToggleDark={handleToggleDark}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:px-8 xl:px-10">{children}</div>
        </main>
      </div>

      <NotificationDrawer
        open={notificationsOpen}
        notifications={notifications}
        onClose={() => setNotificationsOpen(false)}
        onMarkRead={handleMarkNotification}
        onMarkAllRead={handleMarkAllNotifications}
      />
    </div>
  );
}
