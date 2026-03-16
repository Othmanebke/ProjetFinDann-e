'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Map, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';

const DIFF_COLORS: Record<string,string> = { EASY: '#047857', MODERATE: '#D97706', HARD: '#DC2626' };
const DIFF_LABELS: Record<string,string> = { EASY: 'Facile', MODERATE: 'Modéré', HARD: 'Difficile' };
const TYPE_ICONS: Record<string,string> = { RUNNING: '🏃', WALKING: '🚶', CYCLING: '🚴' };

export default function RoutesPage() {
  const { plan } = useAuth();
  const isPremium = plan === 'PREMIUM_COACH' || plan === 'PASS_VOYAGEUR';
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ city: '', country: '', type: 'RUNNING', distanceKm: 5, difficulty: 'MODERATE' });

  useEffect(() => {
    api.get('/api/routes').then(r => setRoutes(r.data.data ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/api/routes/generate', form);
      setRoutes(prev => [res.data, ...prev]);
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    } finally { setGenerating(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'white', border: '1px solid #D6CDB8',
    borderRadius: '10px', padding: '10px 14px', color: '#1C1917',
    fontSize: '14px', boxSizing: 'border-box', fontFamily: '"Inter",sans-serif',
  };

  return (
    <AppLayout>
      <div style={{ padding: '32px', maxWidth: '1000px', background: '#FAF8ED', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#1C1917', fontFamily: '"Montserrat",sans-serif', letterSpacing: '-0.02em' }}>Parcours 🗺️</h1>
            <p style={{ color: '#57534E', fontSize: '14px', marginTop: '6px' }}>Parcours générés par IA dans le monde entier</p>
          </div>
          {isPremium ? (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '10px 20px' }}>
              <Sparkles size={14} /> Générer un parcours IA
            </button>
          ) : (
            <Link href="/billing">
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '10px 20px' }}>
                <Lock size={14} /> Premium requis
              </button>
            </Link>
          )}
        </div>

        {/* Generate form */}
        {showForm && isPremium && (
          <form onSubmit={handleGenerate} style={{ background: 'white', border: '1px solid rgba(234,88,12,0.2)', borderRadius: '20px', padding: '24px', marginBottom: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', alignItems: 'end', boxShadow: '0 2px 12px rgba(234,88,12,0.08)' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', display: 'block', marginBottom: '6px', fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ville *</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inputStyle} placeholder="Barcelona" required />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', display: 'block', marginBottom: '6px', fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pays *</label>
              <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={inputStyle} placeholder="Spain" required />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', display: 'block', marginBottom: '6px', fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
                <option value="RUNNING">🏃 Course</option>
                <option value="WALKING">🚶 Marche</option>
                <option value="CYCLING">🚴 Vélo</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', display: 'block', marginBottom: '6px', fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Distance: {form.distanceKm}km</label>
              <input type="range" min="1" max="30" value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: parseInt(e.target.value) }))} style={{ width: '100%', accentColor: '#EA580C' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', display: 'block', marginBottom: '6px', fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Niveau</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
                <option value="EASY">Facile</option>
                <option value="MODERATE">Modéré</option>
                <option value="HARD">Difficile</option>
              </select>
            </div>
            <button type="submit" disabled={generating} className="btn-primary" style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={13} /> {generating ? 'Génération IA...' : 'Générer'}
            </button>
          </form>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#A8A29E' }}>Chargement...</div>
        ) : routes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <p style={{ color: '#57534E', marginBottom: '20px' }}>Aucun parcours généré</p>
            {isPremium && <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: '13px', padding: '10px 24px' }}>Générer mon premier parcours</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '16px' }}>
            {routes.map((r: any) => (
              <div key={r.id} style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', transition: 'all 0.25s ease', cursor: 'pointer', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.3)'; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 8px 24px rgba(28,25,23,0.1)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.transform = 'none'; el.style.boxShadow = '0 1px 4px rgba(28,25,23,0.05)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{TYPE_ICONS[r.type] ?? '🗺️'}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: `${DIFF_COLORS[r.difficulty]}12`, color: DIFF_COLORS[r.difficulty], border: `1px solid ${DIFF_COLORS[r.difficulty]}25`, fontFamily: '"Montserrat",sans-serif' }}>
                    {DIFF_LABELS[r.difficulty]}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{r.name}</h3>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#57534E', lineHeight: 1.5 }}>{r.description}</p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#A8A29E' }}>
                  <span>📏 {r.distanceKm}km</span>
                  <span>⏱ ~{r.estimatedMinutes}min</span>
                  {r.safetyScore && <span style={{ color: '#047857', fontWeight: 700 }}>🛡️ {r.safetyScore}/10</span>}
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#A8A29E' }}>📍 {r.city}, {r.country}</div>
                {r.aiGenerated && <div style={{ marginTop: '8px' }}><span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(234,88,12,0.1)', color: '#EA580C', border: '1px solid rgba(234,88,12,0.2)', fontFamily: '"Montserrat",sans-serif' }}>✨ IA Généré</span></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
