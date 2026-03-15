"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { User, Mail, Phone, Globe, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    timezone: "Europe/Paris",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.put("/auth/me", form);
      setUser({ ...user!, ...data });
      toast.success("Profil mis à jour !");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Mon profil">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        {/* Avatar + name */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge text-xs ${user?.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                  {user?.role}
                </span>
                <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-400 text-xs">
                  {user?.subscription?.plan || "FREE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-5">Informations personnelles</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                <User className="h-4 w-4 inline mr-1" /> Nom complet
              </label>
              <input
                className="input w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                <Mail className="h-4 w-4 inline mr-1" /> Email
              </label>
              <input
                className="input w-full bg-slate-50 dark:bg-slate-800"
                value={user?.email}
                disabled
              />
              <p className="text-xs text-slate-400 mt-1">L'email ne peut pas être modifié (OAuth)</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                <Phone className="h-4 w-4 inline mr-1" /> Téléphone
              </label>
              <input
                className="input w-full"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+33 6 00 00 00 00"
              />
              <p className="text-xs text-slate-400 mt-1">Utilisé pour les rappels SMS de deadlines</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                <Globe className="h-4 w-4 inline mr-1" /> Fuseau horaire
              </label>
              <select
                className="input w-full"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              >
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              </select>
            </div>
            <button type="submit" disabled={isSaving} className="btn-primary w-full">
              {isSaving ? "Sauvegarde…" : "Enregistrer les modifications"}
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary-500" /> Sécurité
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Authentification OAuth2</p>
                <p className="text-xs text-slate-400">Connexion via {user?.subscription ? "Google/GitHub" : "—"}</p>
              </div>
              <span className="badge bg-green-100 text-green-700 text-xs">Actif</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Toutes les sessions</p>
                <p className="text-xs text-slate-400">Déconnecter tous les appareils</p>
              </div>
              <button
                onClick={() => toast("Fonctionnalité bientôt disponible")}
                className="btn-secondary text-xs text-red-500 hover:text-red-600"
              >
                Déconnecter tout
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
