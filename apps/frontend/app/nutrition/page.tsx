'use client';

import { useState, useEffect } from 'react';
import { Utensils, Flame, Droplets, Apple, Coffee, Plus, Loader2, Trash2, Sparkles, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface NutritionLog {
  id: string;
  mealName: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes?: string;
  tags?: string[];
  loggedAt: string;
}

interface DailySummary {
  logs: NutritionLog[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
}

interface Restaurant {
  restaurant: string;
  mealName: string;
  description: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: string[];
  whyRecommended: string;
  priceRange: string;
}

const DEMO_LOGS: NutritionLog[] = [
  { id: '1', mealName: 'Petit-déjeuner — Porridge avoine', caloriesKcal: 420, proteinG: 14, carbsG: 72, fatG: 8, loggedAt: new Date().toISOString() },
  { id: '2', mealName: 'Collation pré-run', caloriesKcal: 210, proteinG: 6, carbsG: 38, fatG: 5, loggedAt: new Date().toISOString() },
  { id: '3', mealName: 'Déjeuner — Poulet & quinoa', caloriesKcal: 680, proteinG: 52, carbsG: 65, fatG: 18, loggedAt: new Date().toISOString() },
];

const TARGET_KCAL = 2450;

export default function NutritionPage() {
  const { accessToken } = useAuthStore();
  const isDemo = accessToken === 'demo-access-token';

  const [summary, setSummary] = useState<DailySummary>({ logs: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ mealName: '', caloriesKcal: '', proteinG: '', carbsG: '', fatG: '', notes: '' });

  const [showAI, setShowAI] = useState(false);
  const [aiCity, setAiCity] = useState('Paris');
  const [aiCountry, setAiCountry] = useState('France');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<Restaurant[]>([]);

  useEffect(() => {
    if (isDemo) {
      const totals = DEMO_LOGS.reduce((a, l) => ({ calories: a.calories + l.caloriesKcal, protein: a.protein + l.proteinG, carbs: a.carbs + l.carbsG, fat: a.fat + l.fatG }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      setSummary({ logs: DEMO_LOGS, totals });
      setLoading(false);
      return;
    }
    loadDaily();
  }, [isDemo]);

  async function loadDaily() {
    try {
      const { data } = await api.get('/api/nutrition/daily');
      setSummary(data);
    } catch {
      toast.error('Impossible de charger les données nutritionnelles');
    } finally {
      setLoading(false);
    }
  }

  async function addLog() {
    if (!form.mealName) { toast.error('Nom du repas requis'); return; }
    if (isDemo) {
      const newLog: NutritionLog = { id: Date.now().toString(), mealName: form.mealName, caloriesKcal: Number(form.caloriesKcal) || 0, proteinG: Number(form.proteinG) || 0, carbsG: Number(form.carbsG) || 0, fatG: Number(form.fatG) || 0, loggedAt: new Date().toISOString() };
      setSummary(prev => {
        const logs = [newLog, ...prev.logs];
        const totals = { calories: prev.totals.calories + newLog.caloriesKcal, protein: prev.totals.protein + newLog.proteinG, carbs: prev.totals.carbs + newLog.carbsG, fat: prev.totals.fat + newLog.fatG };
        return { logs, totals };
      });
      setShowAddForm(false);
      setForm({ mealName: '', caloriesKcal: '', proteinG: '', carbsG: '', fatG: '', notes: '' });
      toast.success('Repas ajouté !');
      return;
    }
    setAddLoading(true);
    try {
      await api.post('/api/nutrition', {
        mealName: form.mealName,
        caloriesKcal: Number(form.caloriesKcal) || undefined,
        proteinG: Number(form.proteinG) || undefined,
        carbsG: Number(form.carbsG) || undefined,
        fatG: Number(form.fatG) || undefined,
        notes: form.notes || undefined,
      });
      await loadDaily();
      setShowAddForm(false);
      setForm({ mealName: '', caloriesKcal: '', proteinG: '', carbsG: '', fatG: '', notes: '' });
      toast.success('Repas ajouté !');
    } catch {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setAddLoading(false);
    }
  }

  async function deleteLog(id: string) {
    if (isDemo) {
      setSummary(prev => {
        const log = prev.logs.find(l => l.id === id);
        if (!log) return prev;
        return { logs: prev.logs.filter(l => l.id !== id), totals: { calories: prev.totals.calories - log.caloriesKcal, protein: prev.totals.protein - log.proteinG, carbs: prev.totals.carbs - log.carbsG, fat: prev.totals.fat - log.fatG } };
      });
      return;
    }
    try {
      await api.delete(`/api/nutrition/${id}`);
      await loadDaily();
      toast.success('Repas supprimé');
    } catch { toast.error('Erreur lors de la suppression'); }
  }

  async function getAIRecs() {
    if (!aiCity || !aiCountry) { toast.error('Ville et pays requis'); return; }
    setAiLoading(true);
    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 1000));
        setAiRecs([
          { restaurant: 'Brasserie Locale', mealName: 'Poulet rôti & légumes', description: 'Plat riche en protéines, parfaitement adapté à votre objectif.', caloriesKcal: 580, proteinG: 48, carbsG: 35, fatG: 18, tags: ['local', 'high-protein'], whyRecommended: 'Idéal post-entraînement', priceRange: '€€' },
          { restaurant: 'Salad Bar du Marché', mealName: 'Bol Quinoa & Avocat', description: 'Repas végétarien frais plein de bons nutriments.', caloriesKcal: 420, proteinG: 18, carbsG: 52, fatG: 16, tags: ['vegetarian', 'recovery'], whyRecommended: 'Excellente source de glucides lents', priceRange: '€' },
        ]);
      } else {
        const { data } = await api.post('/api/nutrition/recommend', { city: aiCity, country: aiCountry, targetCalories: 600, fitnessGoal: 'ENDURANCE' });
        setAiRecs(data.recommendations ?? []);
      }
    } catch { toast.error('Erreur IA, réessayez'); }
    finally { setAiLoading(false); }
  }

  const { totals } = summary;
  const kcalPct = Math.min(100, Math.round((totals.calories / TARGET_KCAL) * 100));

  const macros = [
    { label: 'Protéines', current: Math.round(totals.protein), target: 160, unit: 'g', color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.18)', icon: Apple },
    { label: 'Glucides',  current: Math.round(totals.carbs),   target: 350, unit: 'g', color: '#EA580C', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.18)',  icon: Flame },
    { label: 'Lipides',   current: Math.round(totals.fat),     target: 80,  unit: 'g', color: '#047857', bg: 'rgba(4,120,87,0.08)',   border: 'rgba(4,120,87,0.18)',   icon: Coffee },
    { label: 'Calories',  current: Math.round(totals.calories),target: TARGET_KCAL, unit: 'kcal', color: '#7C3AED', bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.15)', icon: Droplets },
  ];

  return (
    <AppLayout title="Nutrition">
      <div style={{ padding: '32px', maxWidth: '1200px', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>Nutrition 🥗</h1>
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>Suivi alimentaire du jour · Adapté à vos objectifs</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowAI(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', color: '#7C3AED', fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', cursor: 'pointer' }}>
              <Sparkles size={13} /> Suggestions IA
            </button>
            <button onClick={() => setShowAddForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg,#047857,#065F46)', border: 'none', borderRadius: '999px', color: 'white', fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.3)' }}>
              <Plus size={13} /> Ajouter repas
            </button>
          </div>
        </div>

        {/* Barre calories */}
        <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '22px 28px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={16} style={{ color: '#EA580C' }} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Calories du jour</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>
              {loading ? '—' : totals.calories.toLocaleString()} <span style={{ fontSize: '13px', color: '#A8A29E', fontWeight: 400 }}>/ {TARGET_KCAL.toLocaleString()} kcal</span>
            </span>
          </div>
          <div style={{ background: '#F5F3E7', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '999px', width: `${kcalPct}%`, background: 'linear-gradient(90deg,#EA580C,#D97706)', transition: 'width 1s ease', boxShadow: '0 0 8px rgba(234,88,12,0.35)' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#A8A29E', margin: '8px 0 0' }}>{kcalPct}% de l'objectif · {Math.max(0, TARGET_KCAL - totals.calories)} kcal restantes</p>
        </div>

        {/* Macros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
          {macros.map(({ label, current, target, unit, color, bg, border, icon: Icon }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#57534E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: '"Montserrat",sans-serif' }}>{label}</span>
                <Icon size={14} style={{ color }} />
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>
                {loading ? '—' : current}<span style={{ fontSize: '11px', color: '#A8A29E', fontWeight: 400 }}>{unit}</span>
                <span style={{ fontSize: '11px', color: '#A8A29E', fontWeight: 400 }}> /{target}{unit}</span>
              </p>
              <div style={{ background: 'rgba(28,25,23,0.08)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '999px', width: `${Math.min(100, Math.round((current / target) * 100))}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire ajout repas */}
        {showAddForm && (
          <div style={{ background: 'white', border: '1px solid rgba(4,120,87,0.25)', borderRadius: '20px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(4,120,87,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Ajouter un repas</h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {[
                { key: 'mealName', placeholder: 'Nom du repas *', type: 'text', span: true },
                { key: 'caloriesKcal', placeholder: 'Calories (kcal)', type: 'number' },
                { key: 'proteinG', placeholder: 'Protéines (g)', type: 'number' },
                { key: 'carbsG', placeholder: 'Glucides (g)', type: 'number' },
                { key: 'fatG', placeholder: 'Lipides (g)', type: 'number' },
              ].map(({ key, placeholder, type }) => (
                <input key={key} type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none' }} />
              ))}
            </div>
            <input placeholder="Notes (optionnel)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }} />
            <button onClick={addLog} disabled={addLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#047857,#065F46)', border: 'none', borderRadius: '999px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: addLoading ? 0.7 : 1 }}>
              {addLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={13} />}
              {addLoading ? 'Ajout…' : 'Ajouter'}
            </button>
          </div>
        )}

        {/* Suggestions IA */}
        {showAI && (
          <div style={{ background: 'white', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '20px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(124,58,237,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={15} style={{ color: '#7C3AED' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Recommandations IA locales</h3>
              </div>
              <button onClick={() => setShowAI(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input value={aiCity} onChange={e => setAiCity(e.target.value)} placeholder="Ville" style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none', flex: 1 }} />
              <input value={aiCountry} onChange={e => setAiCountry(e.target.value)} placeholder="Pays" style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none', flex: 1 }} />
              <button onClick={getAIRecs} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'linear-gradient(135deg,rgba(124,58,237,0.9),rgba(109,40,217,0.9))', border: 'none', borderRadius: '999px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: aiLoading ? 0.7 : 1 }}>
                {aiLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
                {aiLoading ? 'Analyse…' : 'Obtenir suggestions'}
              </button>
            </div>
            {aiRecs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {aiRecs.map((r, i) => (
                  <div key={i} style={{ background: '#FAF8ED', border: '1px solid #E5E1D0', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{r.mealName}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#A8A29E' }}>{r.restaurant} · {r.priceRange}</p>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#EA580C' }}>{r.caloriesKcal} kcal</span>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#57534E' }}>{r.description}</p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      {[['P', r.proteinG, '#0E7490'], ['G', r.carbsG, '#EA580C'], ['L', r.fatG, '#047857']].map(([l, v, c]) => (
                        <span key={String(l)} style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '6px', background: `${c}10`, color: String(c), fontWeight: 700 }}>{l}: {v}g</span>
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#7C3AED', fontWeight: 600 }}>💡 {r.whyRecommended}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Journal des repas */}
        <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Utensils size={15} style={{ color: '#047857' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Journal du jour</h3>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}><Loader2 size={24} style={{ color: '#EA580C', animation: 'spin 1s linear infinite' }} /></div>
          ) : summary.logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '32px', margin: '0 0 12px' }}>🍽️</p>
              <p style={{ color: '#57534E', fontSize: '14px', fontWeight: 700, margin: '0 0 6px' }}>Aucun repas enregistré aujourd'hui</p>
              <p style={{ color: '#A8A29E', fontSize: '13px', margin: 0 }}>Ajoutez votre premier repas pour suivre votre nutrition</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.logs.map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#FAF8ED', borderRadius: '14px', border: '1px solid #E5E1D0', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(4,120,87,0.3)'; el.style.background = 'white'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.background = '#FAF8ED'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(4,120,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🍽️</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{log.mealName}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      {[['P', log.proteinG, '#0E7490'], ['G', log.carbsG, '#EA580C'], ['L', log.fatG, '#047857']].map(([l, v, c]) => (
                        Number(v) > 0 ? <span key={String(l)} style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '5px', background: `${c}10`, color: String(c), fontWeight: 700 }}>{l}: {v}g</span> : null
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{log.caloriesKcal} kcal</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#A8A29E' }}>{new Date(log.loggedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button onClick={() => deleteLog(log.id)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={12} style={{ color: '#DC2626' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </AppLayout>
  );
}
