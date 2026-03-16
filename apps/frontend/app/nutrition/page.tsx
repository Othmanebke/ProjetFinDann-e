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

  const inputStyle: React.CSSProperties = {
    background: 'white', border: '1px solid #D6CDB8', borderRadius: '10px',
    padding: '10px 14px', color: '#1C1917', fontSize: '14px',
    fontFamily: '"Inter",sans-serif',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '12px', color: '#57534E', display: 'block', marginBottom: '6px',
    fontWeight: 700, fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <AppLayout>
      <div style={{ padding: '32px', maxWidth: '1000px', background: '#FAF8ED', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1C1917', margin: '0 0 6px', fontFamily: '"Montserrat",sans-serif', letterSpacing: '-0.02em' }}>Nutrition 🍽️</h1>
        <p style={{ color: '#57534E', fontSize: '14px', margin: '0 0 32px' }}>Recommandations de plats locaux adaptés à tes objectifs</p>

        {/* AI Recommender */}
        <div style={{ background: 'white', border: '1px solid rgba(234,88,12,0.18)', borderRadius: '20px', padding: '28px', marginBottom: '32px', boxShadow: '0 2px 12px rgba(234,88,12,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(234,88,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} style={{ color: '#EA580C' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Recommandations IA — Restaurants locaux</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Ville</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="Tokyo" />
            </div>
            <div>
              <label style={labelStyle}>Pays</label>
              <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="Japan" />
            </div>
            <div>
              <label style={labelStyle}>Calories cibles: {form.targetCalories} kcal</label>
              <input type="range" min="300" max="1200" step="50" value={form.targetCalories} onChange={e => setForm(f => ({ ...f, targetCalories: parseInt(e.target.value) }))} style={{ width: '100%', accentColor: '#EA580C' }} />
            </div>
            <div>
              <label style={labelStyle}>Restrictions (séparées par virgule)</label>
              <input value={form.restrictions} onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} placeholder="sans gluten, végétarien" />
            </div>
          </div>
          <button onClick={getRecommendations} disabled={recLoading || !form.city} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '10px 20px', opacity: (recLoading || !form.city) ? 0.6 : 1 }}>
            <Sparkles size={14} /> {recLoading ? 'Analyse en cours...' : 'Obtenir des recommandations'}
          </button>
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
            {recs.map((rec: any, i: number) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '16px', padding: '22px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.25)'; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ fontSize: '22px' }}>🍽️</div>
                  <span style={{ fontSize: '12px', color: '#EA580C', fontWeight: 700, fontFamily: '"Montserrat",sans-serif' }}>{rec.priceRange}</span>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{rec.mealName}</h3>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#57534E' }}>{rec.restaurant}</p>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#A8A29E', lineHeight: 1.5 }}>{rec.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '12px' }}>
                  {([['Kcal', rec.caloriesKcal, '#EA580C'], ['Prot.', `${rec.proteinG}g`, '#047857'], ['Glucides', `${rec.carbsG}g`, '#D97706'], ['Lipides', `${rec.fatG}g`, '#0E7490']] as [string,string,string][]).map(([label, val, color]) => (
                    <div key={label} style={{ textAlign: 'center', background: `${color}0f`, borderRadius: '8px', padding: '6px 4px', border: `1px solid ${color}18` }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color, fontFamily: '"Montserrat",sans-serif' }}>{val}</div>
                      <div style={{ fontSize: '10px', color: '#A8A29E' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#57534E', fontStyle: 'italic' }}>{rec.whyRecommended}</p>
                {rec.tags && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {rec.tags.map((tag: string) => (
                      <span key={tag} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#F5F3E7', color: '#57534E', border: '1px solid #E5E1D0', fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!recLoading && recs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#A8A29E' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍜</div>
            <p style={{ fontSize: '14px', color: '#57534E' }}>Entre une ville et clique sur "Obtenir des recommandations" pour découvrir des plats locaux adaptés à tes objectifs</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
