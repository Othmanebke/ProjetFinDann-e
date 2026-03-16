'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const TYPE_ICONS: Record<string, string> = { RUN: '🏃', WALK: '🚶', CYCLE: '🚴', GYM: '💪', HIIT: '⚡', YOGA: '🧘', SWIM: '🏊' };
const TYPE_LABELS: Record<string, string> = { RUN: 'Course', WALK: 'Marche', CYCLE: 'Vélo', GYM: 'Muscu', HIIT: 'HIIT', YOGA: 'Yoga', SWIM: 'Natation' };
const TYPES = Object.keys(TYPE_ICONS);

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    api.get('/api/workouts?limit=50').then(r => setWorkouts(r.data.data ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? workouts : workouts.filter(w => w.type === filter);

  return (
    <AppLayout>
      <div style={{ padding: '32px', maxWidth: '1000px', background: '#FAF8ED', minHeight: '100vh' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#1C1917', fontFamily: '"Montserrat",sans-serif', letterSpacing: '-0.02em' }}>Mes Séances 🏃</h1>
            <p style={{ color: '#57534E', fontSize: '14px', marginTop: '6px' }}>{workouts.length} séances enregistrées</p>
          </div>
          <Link href="/workouts/new">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '10px 20px' }}>
              <Plus size={14} /> Nouvelle séance
            </button>
          </Link>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['ALL', ...TYPES].map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: '1px solid',
              background: filter === t ? 'rgba(234,88,12,0.12)' : 'white',
              borderColor: filter === t ? 'rgba(234,88,12,0.35)' : '#E5E1D0',
              color: filter === t ? '#EA580C' : '#57534E',
              transition: 'all 0.2s ease',
              fontFamily: '"Montserrat",sans-serif',
            }}>
              {t === 'ALL' ? 'Tous' : `${TYPE_ICONS[t]} ${TYPE_LABELS[t]}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#A8A29E' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏋️</div>
            <p style={{ color: '#57534E', marginBottom: '20px' }}>Aucune séance trouvée</p>
            <Link href="/workouts/new"><button className="btn-primary" style={{ fontSize: '13px', padding: '10px 24px' }}>Enregistrer une séance</button></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((w: any) => (
              <div key={w.id} style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(28,25,23,0.05)' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.3)'; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 4px 16px rgba(28,25,23,0.08)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.transform = 'none'; el.style.boxShadow = '0 1px 3px rgba(28,25,23,0.05)'; }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(234,88,12,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  {TYPE_ICONS[w.type] ?? '🏋️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1C1917', fontSize: '15px', fontFamily: '"Montserrat",sans-serif' }}>{w.title ?? TYPE_LABELS[w.type] ?? w.type}</div>
                  <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {w.distanceKm > 0 && <span>📏 {w.distanceKm}km</span>}
                    <span>⏱ {w.durationMin}min</span>
                    <span>🔥 {w.calories} kcal</span>
                    {w.city && <span>📍 {w.city}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 600 }}>Semaine {w.weekNumber}</div>
                  {w.heartRateAvg && <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '2px' }}>❤️ {w.heartRateAvg} bpm</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
