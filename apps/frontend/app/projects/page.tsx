"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { api } from "@/lib/api";
import { Plus, FolderOpen } from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [isLoading, setIsLoading] = useState(false);
  const { data: projects, isLoading: loading } = useSWR("/projects");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/projects", form);
      toast.success("Projet créé !");
      mutate("/projects");
      setIsCreateOpen(false);
      setForm({ name: "", description: "", color: "#6366f1" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout title="Projets">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm">
              {projects?.pagination?.total || 0} projet(s)
            </p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau projet
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : projects?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <FolderOpen className="h-16 w-16 mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">Aucun projet</h3>
            <p className="text-sm mt-1 mb-6">Créez votre premier projet pour commencer</p>
            <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
              Créer un projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects?.data?.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Nouveau projet"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Nom *</label>
            <input
              className="input w-full"
              placeholder="Ex: Lancement produit Q2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Description</label>
            <textarea
              className="input w-full min-h-[80px] resize-none"
              placeholder="Décrivez votre projet…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Couleur</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-16 rounded cursor-pointer border border-slate-300"
              />
              <span className="text-sm text-slate-500">{form.color}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1">
              {isLoading ? "Création…" : "Créer le projet"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
