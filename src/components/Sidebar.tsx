'use client';

import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard-overview',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Projects',
    href: '/project-management',
    icon: <FolderKanban size={18} />,
    badge: 6,
  },
  {
    label: 'Tasks',
    href: '/task-list-view',
    icon: <ListTodo size={18} />,
    badge: 3,
  },
];

const BOTTOM_NAV: NavItem[] = [
  { label: 'Team', href: '#', icon: <Users size={18} /> },
  { label: 'Settings', href: '#', icon: <Settings size={18} /> },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  currentPath: string;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  currentPath,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const isActive = (href: string) => currentPath === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-border
          sidebar-transition overflow-hidden flex-shrink-0
          ${collapsed ? 'w-16' : 'w-60'}
        `}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 border-b border-border px-4 flex-shrink-0 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <AppLogo size={28} />
                <span className="font-semibold text-base text-foreground tracking-tight">
                  ProjectFlow
                </span>
              </div>
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <AppLogo size={28} />
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Workspace
            </p>
          )}
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={`nav-${item.href}`}
              item={item}
              collapsed={collapsed}
              active={isActive(item.href)}
            />
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="py-4 px-2 border-t border-border space-y-1">
          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={`bottom-nav-${item.href}`}
              item={item}
              collapsed={collapsed}
              active={false}
            />
          ))}

          {/* User avatar */}
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                PS
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Priya Sharma</p>
                <p className="text-xs text-muted-foreground truncate">Admin</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
                PS
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-border
          flex flex-col lg:hidden
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 border-b border-border px-4">
          <div className="flex items-center gap-2">
            <AppLogo size={28} />
            <span className="font-semibold text-base text-foreground">ProjectFlow</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={`mobile-nav-${item.href}`}
              item={item}
              collapsed={false}
              active={isActive(item.href)}
              onClick={onCloseMobile}
            />
          ))}
        </nav>

        <div className="py-4 px-2 border-t border-border space-y-1">
          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={`mobile-bottom-${item.href}`}
              item={item}
              collapsed={false}
              active={false}
              onClick={onCloseMobile}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

function NavLink({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group relative flex items-center rounded-lg transition-all duration-150
        ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}
        ${
          active
            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium' :'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }
      `}
      title={collapsed ? item.label : undefined}
    >
      <span className={`flex-shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
        {item.icon}
      </span>

      {!collapsed && (
        <>
          <span className="text-sm flex-1">{item.label}</span>
          {item.badge !== undefined && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-full tabular-nums
              ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}

      {/* Collapsed tooltip */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {item.label}
          {item.badge !== undefined && (
            <span className="ml-1 bg-indigo-500 text-white text-xs px-1 rounded">{item.badge}</span>
          )}
        </div>
      )}
    </Link>
  );
}