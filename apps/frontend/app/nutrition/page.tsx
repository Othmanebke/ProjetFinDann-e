'use client';

import { Utensils, Flame, Droplets, Apple, Coffee, Plus, TrendingUp, Clock, Leaf, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const meals = [
  { time: '07:30', name: 'Petit-déjeuner', items: 'Porridge avoine, banane, miel, café', kcal: 420, protein: 14, carbs: 72, fat: 8, status: 'done' },
  { time: '10:30', name: 'Collation pré-run', items: 'Barre énergie maison, jus d\'orange', kcal: 210, protein: 6, carbs: 38, fat: 5, status: 'done' },
  { time: '13:00', name: 'Déjeuner', items: 'Poulet grillé, quinoa, brocolis vapeur, huile d\'olive', kcal: 680, protein: 52, carbs: 65, fat: 18, status: 'current' },
  { time: '16:30', name: 'Récupération', items: 'Shaker whey, fruits rouges, amandes', kcal: 320, protein: 32, carbs: 28, fat: 9, status: 'pending' },
  { time: '20:00', name: 'Dîner', items: 'Saumon, patate douce, salade verte, citron', kcal: 590, protein: 44, carbs: 48, fat: 20, status: 'pending' },
];

const localSuggestions = [
  { emoji: '🍜', name: 'Ramen au miso', city: 'Tokyo', kcal: 520, protein: 28, carbs: 68, fat: 14, score: 9.2 },
  { emoji: '🥗', name: 'Salade niçoise', city: 'Nice', kcal: 380, protein: 24, carbs: 22, fat: 22, score: 8.8 },
  { emoji: '🫘', name: 'Açaí bowl tropical', city: 'Lisbonne', kcal: 460, protein: 12, carbs: 74, fat: 16, score: 9.5 },
];

const macros = [
  { label: 'Protéines', current: 108, target: 160, unit: 'g', color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.18)', icon: Apple },
  { label: 'Glucides', current: 175, target: 350, unit: 'g', color: '#EA580C', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.18)', icon: Flame },
  { label: 'Lipides', current: 47, target: 80, unit: 'g', color: '#047857', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.18)', icon: Coffee },
  { label: 'Hydratation', current: 1.6, target: 3, unit: 'L', color: '#7C3AED', bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.15)', icon: Droplets },
];

export default function NutritionPage() {
  const totalKcal = meals.filter(m => m.status === 'done' || m.status === 'current').reduce((s, m) => s + m.kcal, 0);
  const targetKcal = 2450;

  return (
    <AppLayout title="Nutrition">
      <div style={{ padding: '32px', maxWidth: '1200px', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>
              Nutrition 🥗
            </h1>
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>Carburant et récupération · Adapté à vos objectifs</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'white', border: '1px solid #E5E1D0', borderRadius: '999px', color: '#57534E', fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', cursor: 'pointer' }}>
              <Leaf size={13} style={{ color: '#047857' }} /> Recettes locales
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg,#047857,#065F46)', border: 'none', borderRadius: '999px', color: 'white', fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.3)' }}>
              <Plus size={13} /> Ajouter repas
            </button>
          </div>
        </div>

        {/* Calories du jour */}
        <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={16} style={{ color: '#EA580C' }} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Calories du jour</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{totalKcal.toLocaleString()}</span>
              <span style={{ fontSize: '13px', color: '#A8A29E' }}> / {targetKcal.toLocaleString()} kcal</span>
            </div>
          </div>
          <div style={{ background: '#F5F3E7', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '999px', width: `${Math.min(100, Math.round((totalKcal / targetKcal) * 100))}%`, background: 'linear-gradient(90deg,#EA580C,#D97706)', transition: 'width 1s ease', boxShadow: '0 0 8px rgba(234,88,12,0.35)' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#A8A29E', margin: '8px 0 0' }}>{Math.round((totalKcal / targetKcal) * 100)}% de l'objectif · {targetKcal - totalKcal} kcal restantes</p>
        </div>

        {/* Macros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
          {macros.map(({ label, current, target, unit, color, bg, border, icon: Icon }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#57534E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: '"Montserrat",sans-serif' }}>{label}</span>
                <Icon size={14} style={{ color }} />
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>
                {current}<span style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 400 }}>{unit}</span>
                <span style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 400 }}> / {target}{unit}</span>
              </p>
              <div style={{ background: 'rgba(28,25,23,0.08)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '999px', width: `${Math.min(100, Math.round((current / target) * 100))}%`, background: color, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

          {/* Timeline repas */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Clock size={15} style={{ color: '#EA580C' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Plan alimentaire du jour</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {meals.map((meal, idx) => {
                const isDone = meal.status === 'done';
                const isCurrent = meal.status === 'current';
                const dotColor = isDone ? '#047857' : isCurrent ? '#EA580C' : '#E5E1D0';
                const dotShadow = isCurrent ? '0 0 8px rgba(234,88,12,0.6)' : 'none';
                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', opacity: meal.status === 'pending' ? 0.55 : 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: dotColor, boxShadow: dotShadow, marginTop: '4px' }} />
                      {idx < meals.length - 1 && <div style={{ width: '1px', flex: 1, background: '#E5E1D0', margin: '4px 0' }} />}
                    </div>
                    <div style={{ paddingBottom: idx < meals.length - 1 ? '20px' : '0', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#A8A29E' }}>{meal.time}</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{meal.name}</span>
                          {isCurrent && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.25)', color: '#EA580C', fontWeight: 700 }}>En cours</span>}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: isDone ? '#047857' : '#1C1917' }}>{meal.kcal} kcal</span>
                      </div>
                      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#57534E' }}>{meal.items}</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {[['P', meal.protein + 'g', '#0E7490'], ['G', meal.carbs + 'g', '#EA580C'], ['L', meal.fat + 'g', '#047857']].map(([l, v, c]) => (
                          <span key={l} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: `${c}10`, color: c, fontWeight: 700 }}>{l}: {v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Conseil IA */}
            <div style={{ background: 'linear-gradient(135deg,rgba(4,120,87,0.08),rgba(4,120,87,0.04))', border: '1px solid rgba(4,120,87,0.2)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(4,120,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={13} style={{ color: '#047857' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Conseil IA du jour</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#1C1917', lineHeight: 1.6 }}>
                Votre séance de ce soir requiert une bonne charge glucidique. Pensez à consommer 30-40g de glucides 1h avant le run pour optimiser vos performances.
              </p>
            </div>

            {/* Suggestions locales */}
            <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <Utensils size={14} style={{ color: '#EA580C' }} />
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Plats locaux recommandés</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {localSuggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#FAF8ED', borderRadius: '12px', border: '1px solid #E5E1D0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(4,120,87,0.3)'; el.style.background = 'white'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.background = '#FAF8ED'; }}
                  >
                    <span style={{ fontSize: '24px', flexShrink: 0 }}>{s.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{s.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#A8A29E' }}>{s.city} · {s.kcal} kcal · P: {s.protein}g</p>
                    </div>
                    <ChevronRight size={13} style={{ color: '#A8A29E', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Hydratation */}
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Droplets size={14} style={{ color: '#7C3AED' }} />
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Hydratation</h3>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ width: '28px', height: '36px', borderRadius: '6px', background: i < 5 ? '#7C3AED' : 'rgba(124,58,237,0.15)', border: `1px solid ${i < 5 ? '#7C3AED' : 'rgba(124,58,237,0.2)'}`, transition: 'all 0.3s ease' }} />
                ))}
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#57534E' }}><b style={{ color: '#7C3AED' }}>1.6 L</b> sur 3 L objectif · encore 1.4 L</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
