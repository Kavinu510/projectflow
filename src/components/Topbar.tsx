'use client';

import React, { useState } from 'react';
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import { type AppShellUser } from '@/lib/types';

interface TopbarProps {
  title: string;
  subtitle: string;
  currentUser: AppShellUser;
  unreadCount: number;
  darkMode: boolean;
  onOpenNotifications: () => void;
  onMobileMenuToggle: () => void;
  onToggleDark: () => void;
}

export default function Topbar({
  title,
  subtitle,
  currentUser,
  unreadCount,
  darkMode,
  onOpenNotifications,
  onMobileMenuToggle,
  onToggleDark,
}: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-white px-4 dark:bg-slate-950 lg:px-6">
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="hidden items-center md:flex">
        {searchOpen ? (
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              autoFocus
              type="text"
              onBlur={() => setSearchOpen(false)}
              placeholder="Search workspace..."
              className="w-72 rounded-xl border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <Search size={15} />
            Search
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleDark}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <UserMenu currentUser={currentUser} />
      </div>
    </header>
  );
}
