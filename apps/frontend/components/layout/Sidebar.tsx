"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard, FolderOpen, CheckSquare, Bot, CreditCard,
  Settings, BarChart2, Shield, User, LogOut, Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projets", icon: FolderOpen },
  { href: "/tasks", label: "Tâches", icon: CheckSquare },
  { href: "/ai", label: "Assistant IA", icon: Bot },
  { href: "/billing", label: "Abonnement", icon: CreditCard },
  { href: "/metrics", label: "Métriques", icon: BarChart2 },
];

const adminItems = [
  { href: "/admin", label: "Administration", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout, plan } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-sm">
          SP
        </div>
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">SmartProject AI</div>
          <div className="text-xs text-slate-400">{plan} Plan</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx("sidebar-item", pathname.startsWith(href) && "active")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
            {adminItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx("sidebar-item", pathname.startsWith(href) && "active")}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Upgrade CTA for free users */}
      {plan === "FREE" && (
        <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-4 dark:from-primary-950 dark:to-primary-900">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">Passer à Pro</span>
          </div>
          <p className="text-xs text-primary-600 dark:text-primary-500 mb-3">
            Débloquez l'IA avancée, les plans illimités et plus.
          </p>
          <Link href="/billing" className="btn-primary text-xs w-full justify-center py-1.5">
            Voir les plans
          </Link>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-1">
        <Link href="/profile" className={clsx("sidebar-item", pathname === "/profile" && "active")}>
          <User className="h-4 w-4" />
          Profil
        </Link>
        <Link href="/profile/settings" className={clsx("sidebar-item", pathname === "/profile/settings" && "active")}>
          <Settings className="h-4 w-4" />
          Paramètres
        </Link>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 px-3 py-2 mt-2">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
