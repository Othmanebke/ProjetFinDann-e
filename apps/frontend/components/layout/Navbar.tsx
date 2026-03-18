"use client";

import { Bell, Search, Menu, Map, Utensils, Bot, Zap, BarChart3, Settings, CreditCard, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: notifications } = useSWR<any[]>("/notifications");

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  // Close popup if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3 relative">
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

        {/* Avatar avec Dropdown Popup */}
        <div ref={menuRef} className="relative">
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-emerald-600 text-white font-bold text-sm cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-105"
          >
            {user?.name?.charAt(0) || "U"}
          </div>

          {/* Le Pop-up Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || "Sportif Premium"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || "sportif@elan.com"}
                </p>
              </div>
              
              <div className="p-2 space-y-1">
                <Link href="/routes" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Map className="w-4 h-4 text-orange-500" />
                  Parcours
                </Link>
                <Link href="/nutrition" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Utensils className="w-4 h-4 text-emerald-500" />
                  Nutrition
                </Link>
                <Link href="/metrics" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  Performance
                </Link>
                <Link href="/ai" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Bot className="w-4 h-4 text-rose-500" />
                  Coach IA
                </Link>
                <Link href="/explorer" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Zap className="w-4 h-4 text-cyan-500" />
                  Explorer
                </Link>
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button onClick={() => handleNav('/profile')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  Profil
                </button>
                <button 
                  onClick={logout} 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
