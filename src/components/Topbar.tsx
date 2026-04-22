'use client';

import React, { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, ChevronDown } from 'lucide-react';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard-overview': {
    title: 'Dashboard',
    subtitle: 'Apr 22, 2026',
  },
  '/project-management': {
    title: 'Projects',
    subtitle: '8 projects · 5 active',
  },
  '/task-list-view': {
    title: 'All Tasks',
    subtitle: '25 tasks across 7 projects',
  },
};

interface TopbarProps {
  onMobileMenuToggle: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  currentPath: string;
}

export default function Topbar({
  onMobileMenuToggle,
  darkMode,
  onToggleDark,
  currentPath,
}: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pageInfo = PAGE_TITLES[currentPath] ?? { title: 'ProjectFlow', subtitle: '' };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-border flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground leading-tight">{pageInfo.title}</h1>
        <p className="text-xs text-muted-foreground">{pageInfo.subtitle}</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center">
        {searchOpen ? (
          <div className="relative fade-in">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              autoFocus
              type="text"
              placeholder="Search projects, tasks…"
              onBlur={() => setSearchOpen(false)}
              className="w-64 pl-9 pr-4 py-2 text-sm bg-muted rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search size={15} />
            <span>Search</span>
            <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-border rounded font-mono">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 ml-1 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
            PS
          </div>
          <span className="hidden sm:block text-sm font-medium text-foreground">Priya</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}