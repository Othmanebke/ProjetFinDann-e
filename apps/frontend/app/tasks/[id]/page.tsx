"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import useSWR, { mutate } from "swr";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Clock, Flag, User, Tag, ArrowLeft, Edit, Save } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

const statusOptions = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading } = useSWR(`/tasks/${id}`);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      mutate(`/tasks/${id}`);
      toast.success("Statut mis à jour !");
      setStatus(newStatus);
    } catch (err: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4 max-w-3xl">
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!task) {
    return <AppLayout title="Tâche introuvable"><p className="text-slate-400">Cette tâche n'existe pas.</p></AppLayout>;
  }

  return (
    <AppLayout title={task.title}>
      <div className="max-w-3xl space-y-6 animate-fade-in">
        {/* Back */}
        <Link
          href={`/projects/${task.project?.id}`}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au projet {task.project?.name}
        </Link>

        {/* Task header */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{task.title}</h2>
            <button onClick={() => setEditing(!editing)} className="btn-ghost flex items-center gap-2 text-sm">
              <Edit className="h-4 w-4" />
              Modifier
            </button>
          </div>

          {task.description && (
            <p className="text-slate-500 mt-3 text-sm leading-relaxed">{task.description}</p>
          )}

          {/* Metadata */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Statut</label>
              <select
                className="mt-1 input text-sm"
                value={status || task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Priorité</label>
              <div className="mt-1">
                <span className={`badge ${priorityColors[task.priority] || ""} px-3 py-1`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Assigné à</label>
              <div className="mt-1 flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <div className="h-6 w-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {task.assignee.name.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-slate-400">Non assigné</span>
                )}
              </div>
            </div>
            {task.dueDate && (
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Deadline</label>
                <div className="mt-1 flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {format(new Date(task.dueDate), "d MMMM yyyy", { locale: fr })}
                </div>
              </div>
            )}
          </div>

          {task.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {task.tags.map((tag: string) => (
                <span key={tag} className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sub-tasks */}
        {task.subTasks?.length > 0 && (
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Sous-tâches ({task.subTasks.length})</h3>
            <div className="space-y-2">
              {task.subTasks.map((sub: any) => (
                <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className={`h-2 w-2 rounded-full ${sub.status === "DONE" ? "bg-green-500" : "bg-slate-300"}`} />
                  <span className={`text-sm ${sub.status === "DONE" ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        {task.activityLogs?.length > 0 && (
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Historique</h3>
            <div className="space-y-3">
              {task.activityLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">
                    {log.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{log.user?.name}</span>{" "}
                    <span className="text-slate-500">{log.action.replace(".", " ")}</span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(log.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
