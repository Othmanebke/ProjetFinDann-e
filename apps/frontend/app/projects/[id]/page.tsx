"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import useSWR, { mutate } from "swr";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { TaskCard } from "@/components/ui/TaskCard";
import { Plus, Bot, AlertTriangle, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useSWR(`/projects/${id}`);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAIResult] = useState<any>(null);
  const [form, setForm] = useState({
    title: "", description: "", priority: "MEDIUM", dueDate: "",
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tasks", { ...form, projectId: id, dueDate: form.dueDate || undefined });
      toast.success("Tâche créée !");
      mutate(`/projects/${id}`);
      setIsTaskOpen(false);
      setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    }
  };

  const handleGenerateAIPlan = async () => {
    setIsAILoading(true);
    try {
      const { data } = await api.post("/ai/generate-plan", { projectId: id });
      setAIResult(data);
      toast.success("Plan IA généré !");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Erreur IA");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleIdentifyRisks = async () => {
    setIsAILoading(true);
    try {
      const { data } = await api.post("/ai/risks", { projectId: id });
      setAIResult(data);
      toast.success("Analyse des risques terminée !");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur IA");
    } finally {
      setIsAILoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return <AppLayout title="Projet introuvable"><p className="text-slate-400">Ce projet n'existe pas.</p></AppLayout>;
  }

  const tasksByStatus: Record<string, any[]> = {
    BACKLOG: [], TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [],
  };
  project.tasks?.forEach((t: any) => {
    if (tasksByStatus[t.status]) tasksByStatus[t.status].push(t);
  });

  return (
    <AppLayout title={project.name}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h2>
                <span className={`badge text-xs ${statusColors[project.status] || "bg-slate-100 text-slate-600"}`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-slate-500 text-sm mb-4">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>👥 {project.members?.length || 0} membres</span>
                <span>📋 {project._count?.tasks || 0} tâches</span>
                {project.endDate && (
                  <span>📅 Deadline: {new Date(project.endDate).toLocaleDateString("fr-FR")}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleIdentifyRisks}
                disabled={isAILoading}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                Risques IA
              </button>
              <button
                onClick={handleGenerateAIPlan}
                disabled={isAILoading}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Bot className="h-4 w-4" />
                {isAILoading ? "Génération…" : "Plan IA"}
              </button>
              <button
                onClick={() => setIsTaskOpen(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Tâche
              </button>
            </div>
          </div>
        </div>

        {/* AI Result */}
        {aiResult && (
          <div className="card p-6 border-primary-200 bg-primary-50 dark:bg-primary-950 dark:border-primary-800">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-5 w-5 text-primary-600" />
              <h3 className="font-semibold text-primary-700 dark:text-primary-400">Résultat IA</h3>
              <button onClick={() => setAIResult(null)} className="ml-auto text-slate-400 hover:text-slate-600 text-xs">
                ✕ Fermer
              </button>
            </div>
            <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(aiResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Kanban Board */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4" style={{ minWidth: "900px" }}>
            {Object.entries(tasksByStatus).map(([status, tasks]) => (
              <div key={status} className="flex-1 min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{status.replace("_", " ")}</h4>
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs">
                    {tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 p-4 text-center">
                      <p className="text-xs text-slate-400">Aucune tâche</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} title="Nouvelle tâche">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Titre *</label>
            <input
              className="input w-full"
              placeholder="Titre de la tâche"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Description</label>
            <textarea
              className="input w-full min-h-[70px] resize-none"
              placeholder="Décrivez la tâche…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Priorité</label>
              <select
                className="input w-full"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Deadline</label>
              <input
                type="date"
                className="input w-full"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsTaskOpen(false)} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1">Créer la tâche</button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
