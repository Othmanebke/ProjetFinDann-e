"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/ui/KPICard";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import useSWR from "swr";
import {
  FolderOpen, CheckSquare, Bot, TrendingUp, Clock, AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const { data: projects } = useSWR("/projects?limit=100");
  const { data: tasks } = useSWR("/tasks?limit=100");

  const totalProjects = projects?.pagination?.total || 0;
  const totalTasks = tasks?.pagination?.total || 0;
  const doneTasks = tasks?.data?.filter((t: any) => t.status === "DONE").length || 0;
  const urgentTasks = tasks?.data?.filter((t: any) => t.priority === "URGENT" && t.status !== "DONE").length || 0;

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Projets actifs"
            value={totalProjects}
            icon={<FolderOpen className="h-5 w-5" />}
            color="primary"
            trend="+2 ce mois"
          />
          <KPICard
            title="Tâches totales"
            value={totalTasks}
            icon={<CheckSquare className="h-5 w-5" />}
            color="green"
            trend={`${completionRate}% complétées`}
          />
          <KPICard
            title="Tâches urgentes"
            value={urgentTasks}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="red"
            trend="À traiter"
          />
          <KPICard
            title="Taux de complétion"
            value={`${completionRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            color="blue"
            trend="Progression globale"
          />
        </div>

        {/* Charts + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Activité des tâches</h3>
              <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                <option>7 derniers jours</option>
                <option>30 derniers jours</option>
              </select>
            </div>
            <ActivityChart />
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Activité récente</h3>
            <RecentActivity />
          </div>
        </div>

        {/* Quick projects overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Projets récents</h3>
            <a href="/projects" className="text-sm text-primary-600 hover:text-primary-700">
              Voir tout →
            </a>
          </div>
          <div className="space-y-3">
            {projects?.data?.slice(0, 5).map((project: any) => (
              <a
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: project.color || "#6366f1" }}
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{project.name}</div>
                    <div className="text-xs text-slate-400">{project._count?.tasks || 0} tâches</div>
                  </div>
                </div>
                <span className={`badge text-xs ${
                  project.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                  project.status === "PLANNING" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {project.status}
                </span>
              </a>
            ))}
            {!projects?.data?.length && (
              <div className="text-center py-8 text-slate-400">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun projet. <a href="/projects" className="text-primary-600">Créer un projet →</a></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
