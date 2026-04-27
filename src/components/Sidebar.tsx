'use client';

import Link from 'next/link';
import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
  X,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import UserMenu from '@/components/UserMenu';
import { type AppShellUser } from '@/lib/types';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  currentPath: string;
  currentUser: AppShellUser;
  isAdmin: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard-overview', icon: <LayoutDashboard size={18} /> },
  { label: 'Projects', href: '/project-management', icon: <FolderKanban size={18} /> },
  { label: 'Tasks', href: '/task-list-view', icon: <ListTodo size={18} /> },
];

const bottomNavItems = [
  { label: 'Team', href: '/team', icon: <Users size={18} /> },
  { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  currentPath,
  currentUser,
  isAdmin,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`hidden min-h-screen flex-shrink-0 flex-col border-r border-border bg-white dark:bg-slate-950 lg:flex ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div
          className={`flex h-16 items-center border-b border-border px-4 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3">
                <AppLogo size={30} />
                <div>
                  <p className="text-base font-semibold text-foreground">FernFlow</p>
                  <p className="text-xs text-muted-foreground">Internal workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Workspace
              </p>
            )}
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                currentPath={currentPath}
                collapsed={collapsed}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </div>

          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Manage
              </p>
            )}
            {bottomNavItems
              .filter((item) => (item.href === '/settings' ? isAdmin : true))
              .map((item) => (
                <NavLink
                  key={item.href}
                  currentPath={currentPath}
                  collapsed={collapsed}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
          </div>
        </nav>

        <div className="border-t border-border px-3 py-4">
          {collapsed ? (
            <div className="flex justify-center">
              <UserMenu compact currentUser={currentUser} isAdmin={isAdmin} />
            </div>
          ) : (
            <UserMenu currentUser={currentUser} isAdmin={isAdmin} />
          )}
        </div>
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-white transition-transform duration-300 dark:bg-slate-950 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <AppLogo size={30} />
            <div>
              <p className="text-base font-semibold text-foreground">FernFlow</p>
              <p className="text-xs text-muted-foreground">Internal workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="space-y-6 px-3 py-5">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Workspace
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                currentPath={currentPath}
                collapsed={false}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onClick={onCloseMobile}
              />
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Manage
            </p>
            {bottomNavItems
              .filter((item) => (item.href === '/settings' ? isAdmin : true))
              .map((item) => (
                <NavLink
                  key={item.href}
                  currentPath={currentPath}
                  collapsed={false}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onClick={onCloseMobile}
                />
              ))}
          </div>
        </nav>

        <div className="border-t border-border px-3 py-4">
          <UserMenu currentUser={currentUser} isAdmin={isAdmin} />
        </div>
      </aside>
    </>
  );
}

function NavLink({
  currentPath,
  collapsed,
  href,
  icon,
  label,
  onClick,
}: {
  currentPath: string;
  collapsed: boolean;
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  const active = currentPath === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center rounded-xl transition ${
        collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-3'
      } ${
        active
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900'
      }`}
      title={collapsed ? label : undefined}
    >
      <span>{icon}</span>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}
