'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Utensils, Sparkles } from 'lucide-react';

export default function NutritionPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [form, setForm] = useState({ city: user?.currentCity ?? '', country: user?.currentCountry ?? '', targetCalories: 600, restrictions: '' });

  useEffect(() => {
    // In a real app, fetch from /api/nutrition. For now show empty state.
    setLoading(false);
  }, []);

  const getRecommendations = async () => {
    setRecLoading(true);
    try {
      const res = await api.post('/api/routes/restaurants', {
        city: form.city,
        country: form.country,
        targetCalories: form.targetCalories,
        fitnessGoal: user?.fitnessGoal ?? 'MAINTENANCE',
        restrictions: form.restrictions ? form.restrictions.split(',').map(s => s.trim()) : [],
      });
      setRecs(res.data.recommendations ?? []);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur');
    } finally { setRecLoading(false); }
  };

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#f8fafc', fontSize: '14px' };

  return (
    <AppLayout>
      <div style={{ padding: '32px', maxWidth: '1000px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' }}>Nutrition 🍽️</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px' }}>Recommandations de plats locaux adaptés à tes objectifs</p>

        {/* AI Recommender */}
        <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Sparkles size={18} style={{ color: '#a78bfa' }} />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>Recommandations IA — Restaurants locaux</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Ville</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="Tokyo" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Pays</label>
              <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="Japan" />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Calories cibles: {form.targetCalories} kcal</label>
              <input type="range" min="300" max="1200" step="50" value={form.targetCalories} onChange={e => setForm(f => ({ ...f, targetCalories: parseInt(e.target.value) }))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Restrictions (séparées par virgule)</label>
              <input value={form.restrictions} onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="sans gluten, végétarien" />
            </div>
          </div>
          <button onClick={getRecommendations} disabled={recLoading || !form.city} className="btn-glow" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '10px 20px' }}>
            <Sparkles size={14} /> {recLoading ? 'Analyse en cours...' : 'Obtenir des recommandations'}
          </button>
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
            {recs.map((rec: any, i: number) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ fontSize: '22px' }}>🍽️</div>
                  <span style={{ fontSize: '12px', color: '#a78bfa' }}>{rec.priceRange}</span>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>{rec.mealName}</h3>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>{rec.restaurant}</p>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>{rec.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '12px' }}>
                  {[['Kcal', rec.caloriesKcal, '#f43f5e'], ['Prot.', `${rec.proteinG}g`, '#10b981'], ['Glucides', `${rec.carbsG}g`, '#f59e0b'], ['Lipides', `${rec.fatG}g`, '#8b5cf6']].map(([label, val, color]) => (
                    <div key={label as string} style={{ textAlign: 'center', background: `${color}12`, borderRadius: '8px', padding: '6px 4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: color as string }}>{val}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>{rec.whyRecommended}</p>
                {rec.tags && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {rec.tags.map((tag: string) => (
                      <span key={tag} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!recLoading && recs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍜</div>
            <p style={{ fontSize: '14px' }}>Entre une ville et clique sur "Obtenir des recommandations" pour découvrir des plats locaux adaptés à tes objectifs</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
