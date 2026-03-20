'use client';

import { Map, Navigation, Mountain, Clock, TrendingUp, Shield, Star, ChevronRight, Plus, MapPin, Zap } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

const routes = [
  { id: 1, name: 'Boucle du Canal Saint-Martin', city: '🇫🇷 Paris', distance: 8.2, duration: 48, elevation: 12, difficulty: 'Facile', safety: 9.2, type: 'RUN', tags: ['Urbain', 'Plat', 'Culturel'] },
  { id: 2, name: 'Crêtes du Tibidabo', city: '🇪🇸 Barcelone', distance: 14.7, duration: 92, elevation: 480, difficulty: 'Difficile', safety: 8.1, type: 'TRAIL', tags: ['Nature', 'Montagne', 'Vue panoramique'] },
  { id: 3, name: 'Sentier de la Corniche', city: '🇵🇹 Lisbonne', distance: 11.3, duration: 65, elevation: 180, difficulty: 'Modéré', safety: 9.5, type: 'RUN', tags: ['Côtier', 'Historique'] },
  { id: 4, name: 'Bois de Vincennes Est', city: '🇫🇷 Paris', distance: 6.5, duration: 38, elevation: 25, difficulty: 'Facile', safety: 9.8, type: 'RUN', tags: ['Parc', 'Ombragé'] },
];

const suggestions = [
  { name: 'Promenade des Anglais', city: '🇫🇷 Nice', distance: 9.5, difficulty: 'Facile', score: 9.7 },
  { name: 'Chemin de Ronde', city: '🇯🇵 Tokyo', distance: 12.0, difficulty: 'Modéré', score: 8.9 },
  { name: 'Rambla del Mar', city: '🇪🇸 Barcelone', distance: 7.2, difficulty: 'Facile', score: 9.4 },
];

const difficultyColor = (d: string) => {
  if (d === 'Facile') return { bg: 'rgba(4,120,87,0.1)', color: '#047857', border: 'rgba(4,120,87,0.2)' };
  if (d === 'Modéré') return { bg: 'rgba(234,88,12,0.1)', color: '#EA580C', border: 'rgba(234,88,12,0.2)' };
  return { bg: 'rgba(220,38,38,0.1)', color: '#DC2626', border: 'rgba(220,38,38,0.2)' };
};

export default function RoutesPage() {
  return (
    <AppLayout title="Parcours">
      <div style={{ padding: '32px', maxWidth: '1200px', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>
              Mes Parcours 🗺️
            </h1>
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>Itinéraires IA générés dans 127+ villes du monde</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg,#EA580C,#C2410C)', border: 'none', borderRadius: '999px', color: 'white', fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
            <Plus size={14} /> Nouveau parcours IA
          </button>
        </div>

        {/* Stats rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Parcours créés', value: '24', icon: Map, color: '#EA580C', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.18)' },
            { label: 'Km explorés', value: '312', icon: Navigation, color: '#047857', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.18)' },
            { label: 'Villes visitées', value: '9', icon: MapPin, color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.18)' },
            { label: 'Dénivelé cumulé', value: '4 820 m', icon: Mountain, color: '#7C3AED', bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.15)' },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#57534E', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

          {/* Liste parcours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#1C1917', margin: '0 0 4px', fontFamily: '"Montserrat",sans-serif' }}>Parcours récents</h2>
            {routes.map((r) => {
              const diff = difficultyColor(r.difficulty);
              return (
                <div key={r.id} style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '18px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.35)'; el.style.boxShadow = '0 4px 16px rgba(234,88,12,0.1)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.boxShadow = '0 1px 4px rgba(28,25,23,0.05)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{r.name}</span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`, fontWeight: 700 }}>{r.difficulty}</span>
                      </div>
                      <span style={{ fontSize: '13px', color: '#A8A29E' }}>{r.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(4,120,87,0.08)', border: '1px solid rgba(4,120,87,0.2)', borderRadius: '8px', padding: '4px 10px' }}>
                      <Shield size={12} style={{ color: '#047857' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>{r.safety}/10</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                    {[
                      { icon: Navigation, label: `${r.distance} km` },
                      { icon: Clock, label: `${r.duration} min` },
                      { icon: Mountain, label: `+${r.elevation} m` },
                    ].map(({ icon: Ic, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Ic size={13} style={{ color: '#A8A29E' }} />
                        <span style={{ fontSize: '13px', color: '#57534E', fontWeight: 600 }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {r.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: '#F5F3E7', border: '1px solid #E5E1D0', color: '#57534E', fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar suggestions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Carte preview */}
            <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
              <div style={{ height: '180px', background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} viewBox="0 0 300 180">
                  <path d="M 30 130 Q 90 60 140 100 Q 190 140 240 70 Q 270 40 290 90" stroke="#047857" strokeWidth="3" fill="none" strokeDasharray="8 4" strokeLinecap="round" />
                  <circle cx="30" cy="130" r="7" fill="#EA580C" />
                  <circle cx="290" cy="90" r="7" fill="#047857" />
                  <circle cx="140" cy="100" r="4" fill="white" stroke="#047857" strokeWidth="2" />
                  <circle cx="240" cy="70" r="4" fill="white" stroke="#047857" strokeWidth="2" />
                </svg>
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(250,248,237,0.9)', backdropFilter: 'blur(8px)', borderRadius: '8px', padding: '5px 10px', fontSize: '10px', fontWeight: 700, color: '#EA580C', fontFamily: '"Montserrat",sans-serif', letterSpacing: '0.06em', border: '1px solid rgba(234,88,12,0.2)' }}>
                  IA • LIVE
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917', margin: '0 0 4px', fontFamily: '"Montserrat",sans-serif' }}>Parcours du jour généré</p>
                <p style={{ fontSize: '12px', color: '#A8A29E', margin: 0 }}>8.2 km · Score sécurité 9.2/10 · Départ recommandé 7h00</p>
              </div>
            </div>

            {/* Suggestions IA */}
            <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <Zap size={14} style={{ color: '#EA580C' }} />
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Suggestions IA</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#FAF8ED', borderRadius: '12px', border: '1px solid #E5E1D0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.3)'; el.style.background = 'white'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.background = '#FAF8ED'; }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(4,120,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Map size={15} style={{ color: '#047857' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1C1917', fontFamily: '"Montserrat",sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#A8A29E' }}>{s.city} · {s.distance} km</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={11} style={{ color: '#EA580C' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C' }}>{s.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats dénivelé */}
            <div style={{ background: 'linear-gradient(135deg,rgba(234,88,12,0.08),rgba(4,120,87,0.06))', border: '1px solid rgba(234,88,12,0.2)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <TrendingUp size={14} style={{ color: '#EA580C' }} />
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Cette semaine</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[['3', 'Sorties'], ['37.4 km', 'Distance'], ['1h 45', 'Actif'], ['+620 m', 'Dénivelé']].map(([v, l]) => (
                  <div key={l}>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{v}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#A8A29E', fontWeight: 600 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
