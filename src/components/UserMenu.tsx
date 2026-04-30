'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, LogOut, Settings, UserCircle2 } from 'lucide-react';
import { type AppShellUser } from '@/lib/types';

interface UserMenuProps {
  currentUser: AppShellUser;
  compact?: boolean;
}

export default function UserMenu({ currentUser, compact = false }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className={`flex items-center gap-2 rounded-xl transition hover:bg-muted ${
          compact ? 'px-2 py-2' : 'px-2 py-1.5'
        }`}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: currentUser.color }}
        >
          {currentUser.initials}
        </div>
        {!compact && (
          <>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium text-foreground">{currentUser.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.title || currentUser.role}
              </p>
            </div>
            <ChevronDown size={14} className="text-muted-foreground" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border bg-white p-2 shadow-card-hover dark:bg-slate-900">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-semibold text-foreground">{currentUser.fullName}</p>
            <p className="text-xs text-muted-foreground">{currentUser.title || currentUser.role}</p>
          </div>

          <div className="py-2">
            <MenuLink href="/profile" icon={<UserCircle2 size={15} />} label="My Profile" />
            <MenuLink href="/notifications" icon={<Bell size={15} />} label="Notifications" />
            <MenuLink href="/settings" icon={<Settings size={15} />} label="Settings" />
          </div>

          <form action="/auth/signout" method="post" className="border-t border-border pt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}
