"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import useSWR from "swr";
import { api } from "@/lib/api";
import { KPICard } from "@/components/ui/KPICard";
import { Users, FolderOpen, CheckSquare, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { data: stats } = useSWR("/admin/stats");
  const { data: users, mutate: mutateUsers } = useSWR("/admin/users");

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`);
      mutateUsers();
      toast.success(`Utilisateur ${currentActive ? "désactivé" : "activé"}`);
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <AppLayout title="Administration">
      <div className="space-y-6 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Utilisateurs" value={stats?.usersTotal || 0} icon={<Users className="h-5 w-5" />} color="primary" />
          <KPICard title="Projets" value={stats?.projectsTotal || 0} icon={<FolderOpen className="h-5 w-5" />} color="green" />
          <KPICard title="Tâches" value={stats?.tasksTotal || 0} icon={<CheckSquare className="h-5 w-5" />} color="blue" />
          <KPICard
            title="Abonnés Pro+"
            value={stats?.subscriptionsByPlan?.filter((p: any) => p.plan !== "FREE").reduce((a: number, p: any) => a + p._count.id, 0) || 0}
            icon={<TrendingUp className="h-5 w-5" />}
            color="orange"
          />
        </div>

        {/* Subscriptions breakdown */}
        {stats?.subscriptionsByPlan && (
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Répartition abonnements</h3>
            <div className="flex gap-6">
              {stats.subscriptionsByPlan.map((p: any) => (
                <div key={p.plan} className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{p._count.id}</div>
                  <div className="text-xs text-slate-400 mt-1">{p.plan}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">Utilisateurs ({users?.pagination?.total || 0})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["Utilisateur", "Rôle", "Plan", "Statut", "Dernière connexion", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users?.data?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge text-xs ${user.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400 text-xs">
                        {user.subscription?.plan || "FREE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge text-xs ${user.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("fr-FR") : "Jamais"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                      >
                        {user.isActive ? "Désactiver" : "Activer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
