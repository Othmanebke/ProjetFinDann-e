'use client';

import { useState, useEffect } from 'react';
import { Map, Navigation, Mountain, Clock, Shield, Star, Plus, MapPin, Zap, Loader2, Trash2, Globe } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface Route {
  id: string;
  name: string;
  city: string;
  country: string;
  distanceKm: number;
  estimatedMinutes: number;
  difficulty: string;
  safetyScore: number;
  type: string;
  aiGenerated: boolean;
  description?: string;
}

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  EASY:     { bg: 'rgba(4,120,87,0.1)',   color: '#047857', border: 'rgba(4,120,87,0.2)',   label: 'Facile' },
  MODERATE: { bg: 'rgba(234,88,12,0.1)',  color: '#EA580C', border: 'rgba(234,88,12,0.2)',  label: 'Modéré' },
  HARD:     { bg: 'rgba(220,38,38,0.1)',  color: '#DC2626', border: 'rgba(220,38,38,0.2)',  label: 'Difficile' },
};

const DEMO_ROUTES: Route[] = [
  { id: '1', name: 'Boucle du Canal Saint-Martin', city: 'Paris', country: 'France', distanceKm: 8.2, estimatedMinutes: 48, difficulty: 'EASY', safetyScore: 9.2, type: 'RUNNING', aiGenerated: true },
  { id: '2', name: 'Crêtes du Tibidabo', city: 'Barcelone', country: 'Espagne', distanceKm: 14.7, estimatedMinutes: 92, difficulty: 'HARD', safetyScore: 8.1, type: 'RUNNING', aiGenerated: true },
  { id: '3', name: 'Sentier de la Corniche', city: 'Lisbonne', country: 'Portugal', distanceKm: 11.3, estimatedMinutes: 65, difficulty: 'MODERATE', safetyScore: 9.5, type: 'RUNNING', aiGenerated: true },
];

export default function RoutesPage() {
  const { accessToken } = useAuthStore();
  const isDemo = accessToken === 'demo-access-token';

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ city: '', country: '', type: 'RUNNING', distanceKm: 8, difficulty: 'MODERATE' });

  useEffect(() => {
    if (isDemo) { setRoutes(DEMO_ROUTES); setLoading(false); return; }
    loadRoutes();
  }, [isDemo]);

  async function loadRoutes() {
    try {
      const { data } = await api.get('/api/routes');
      setRoutes(data.data ?? []);
    } catch {
      toast.error('Impossible de charger les parcours');
    } finally {
      setLoading(false);
    }
  }

  async function generateRoute() {
    if (!form.city || !form.country) { toast.error('Ville et pays requis'); return; }
    if (isDemo) {
      toast.success('Parcours IA généré ! (mode démo)');
      const mock: Route = { id: Date.now().toString(), name: `Parcours Découverte - ${form.city}`, city: form.city, country: form.country, distanceKm: form.distanceKm, estimatedMinutes: form.distanceKm * 6, difficulty: form.difficulty, safetyScore: 9.0, type: form.type, aiGenerated: true };
      setRoutes(prev => [mock, ...prev]);
      setShowForm(false);
      return;
    }
    setGenerating(true);
    try {
      const { data } = await api.post('/api/routes/generate', { ...form, distanceKm: Number(form.distanceKm) });
      setRoutes(prev => [data, ...prev]);
      setShowForm(false);
      toast.success('Parcours IA généré !');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  }

  async function deleteRoute(id: string) {
    if (isDemo) { setRoutes(prev => prev.filter(r => r.id !== id)); return; }
    try {
      await api.delete(`/api/routes/${id}`);
      setRoutes(prev => prev.filter(r => r.id !== id));
      toast.success('Parcours supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }

  return (
    <AppLayout title="Parcours">
      <div style={{ padding: '32px', maxWidth: '1200px', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>
              Mes Parcours 🗺️
            </h1>
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>Itinéraires générés par IA dans 127+ villes du monde</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#EA580C,#C2410C)', border: 'none', borderRadius: '999px', color: 'white', fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
            <Zap size={14} /> Générer un parcours IA
          </button>
        </div>

        {/* Formulaire de génération */}
        {showForm && (
          <div style={{ background: 'white', border: '1px solid rgba(234,88,12,0.25)', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(234,88,12,0.1)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Nouveau parcours IA</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { key: 'city', placeholder: 'Ville *', type: 'text' },
                { key: 'country', placeholder: 'Pays *', type: 'text' },
              ].map(({ key, placeholder }) => (
                <input key={key} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none' }} />
              ))}
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none' }}>
                <option value="RUNNING">🏃 Running</option>
                <option value="WALKING">🚶 Marche</option>
                <option value="CYCLING">🚴 Vélo</option>
              </select>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none' }}>
                <option value="EASY">Facile</option>
                <option value="MODERATE">Modéré</option>
                <option value="HARD">Difficile</option>
              </select>
              <input type="number" min={1} max={50} value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: Number(e.target.value) }))} placeholder="Distance (km)"
                style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={generateRoute} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#EA580C,#C2410C)', border: 'none', borderRadius: '999px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: generating ? 0.7 : 1 }}>
                {generating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
                {generating ? 'Génération en cours…' : 'Générer avec l\'IA'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 16px', borderRadius: '999px', border: '1px solid #E5E1D0', background: 'white', fontSize: '13px', color: '#57534E', cursor: 'pointer' }}>Annuler</button>
            </div>
          </div>
        )}

        {/* Stats rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Parcours créés', value: routes.length.toString(), icon: Map, color: '#EA580C', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.18)' },
            { label: 'Km explorés', value: routes.reduce((s, r) => s + r.distanceKm, 0).toFixed(1), icon: Navigation, color: '#047857', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.18)' },
            { label: 'Villes visitées', value: [...new Set(routes.map(r => r.city))].length.toString(), icon: Globe, color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.18)' },
            { label: 'Générés par IA', value: routes.filter(r => r.aiGenerated).length.toString(), icon: Zap, color: '#7C3AED', bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.15)' },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: '#57534E', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>{loading ? '—' : value}</div>
            </div>
          ))}
        </div>

        {/* Liste des parcours */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Loader2 size={28} style={{ color: '#EA580C', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : routes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', background: 'white', borderRadius: '20px', border: '1px solid #E5E1D0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <p style={{ color: '#57534E', fontSize: '16px', fontWeight: 700, margin: '0 0 8px', fontFamily: '"Montserrat",sans-serif' }}>Aucun parcours pour l'instant</p>
            <p style={{ color: '#A8A29E', fontSize: '13px', margin: '0 0 20px' }}>Générez votre premier parcours IA en quelques secondes</p>
            <button onClick={() => setShowForm(true)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#EA580C,#C2410C)', border: 'none', borderRadius: '999px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Générer mon premier parcours</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {routes.map(r => {
              const diff = DIFFICULTY_STYLES[r.difficulty] ?? DIFFICULTY_STYLES.MODERATE;
              return (
                <div key={r.id} style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '18px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.3)'; el.style.boxShadow = '0 4px 16px rgba(234,88,12,0.08)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.boxShadow = '0 1px 4px rgba(28,25,23,0.05)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{r.name}</span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`, fontWeight: 700 }}>{diff.label}</span>
                        {r.aiGenerated && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(124,58,237,0.1)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)', fontWeight: 700 }}>⚡ IA</span>}
                      </div>
                      <span style={{ fontSize: '13px', color: '#A8A29E' }}>📍 {r.city}, {r.country}</span>
                      {r.description && <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#57534E' }}>{r.description}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(4,120,87,0.08)', border: '1px solid rgba(4,120,87,0.2)', borderRadius: '8px', padding: '4px 10px' }}>
                        <Shield size={12} style={{ color: '#047857' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>{r.safetyScore}/10</span>
                      </div>
                      <button onClick={() => deleteRoute(r.id)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={12} style={{ color: '#DC2626' }} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    {[
                      { icon: Navigation, label: `${r.distanceKm} km` },
                      { icon: Clock, label: `${r.estimatedMinutes} min` },
                      { icon: Map, label: r.type === 'RUNNING' ? '🏃 Running' : r.type === 'WALKING' ? '🚶 Marche' : '🚴 Vélo' },
                    ].map(({ icon: Ic, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Ic size={13} style={{ color: '#A8A29E' }} />
                        <span style={{ fontSize: '13px', color: '#57534E', fontWeight: 600 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </AppLayout>
  );
}
