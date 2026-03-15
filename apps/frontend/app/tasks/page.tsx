"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import useSWR from "swr";
import { TaskCard } from "@/components/ui/TaskCard";
import { useState } from "react";
import { CheckSquare } from "lucide-react";

const STATUSES = ["", "BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const PRIORITIES = ["", "LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TasksPage() {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);

  const { data: tasks, isLoading } = useSWR(`/tasks?${params.toString()}`);

  return (
    <AppLayout title="Mes tâches">
      <div className="space-y-6 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select className="input text-sm w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUSES.slice(1).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select className="input text-sm w-auto" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Toutes les priorités</option>
            {PRIORITIES.slice(1).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="flex items-center text-sm text-slate-400 ml-auto">
            {tasks?.pagination?.total || 0} tâche(s)
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : tasks?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <CheckSquare className="h-16 w-16 mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-slate-600">Aucune tâche</h3>
            <p className="text-sm mt-1">Créez des tâches depuis un projet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks?.data?.map((task: any) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
