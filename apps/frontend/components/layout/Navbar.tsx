"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: notifications } = useSWR<any[]>("/notifications");

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-colors dark:border-slate-700 dark:hover:border-slate-600"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:block">Rechercher…</span>
          <kbd className="hidden sm:block rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-xs cursor-pointer">
          {user?.name?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
}
