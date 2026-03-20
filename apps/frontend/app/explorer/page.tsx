'use client';

import { useState } from 'react';
import { Compass, Users, Trophy, MapPin, Heart, TrendingUp, Globe, Star, Zap, ChevronRight } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const tabs = ['Tendances', 'Communauté', 'Défis', 'Événements'];

const challenges = [
  { emoji: '🏃', title: '100km de Mars', desc: 'Courez 100 km ce mois-ci pour débloquer le badge Explorateur.', participants: 12450, progress: 62, days: 11, badge: '🥇', color: '#EA580C', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.2)' },
  { emoji: '🌍', title: 'Tour du monde virtuel', desc: 'Franchissez 40 075 km collectivement avec la communauté Élan.', participants: 5200, progress: 78, days: 28, badge: '🌍', color: '#047857', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.2)' },
  { emoji: '⛰️', title: 'Défi dénivelé 2025', desc: 'Cumulez 8 848 m de D+ (altitude Everest) avant fin décembre.', participants: 3840, progress: 34, days: 285, badge: '🏔️', color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.2)' },
];

const spots = [
  { img: '🏖️', name: 'Promenade des Anglais', city: 'Nice, France', distance: '9.5 km', difficulty: 'Facile', rating: 4.9, runs: '2.4k', tag: 'Côtier' },
  { img: '⛩️', name: 'Sentier Meiji Jingu', city: 'Tokyo, Japon', distance: '6.2 km', difficulty: 'Facile', rating: 4.8, runs: '8.1k', tag: 'Culturel' },
  { img: '🏔️', name: 'Chemin de Ronde Barri Gòtic', city: 'Barcelone, Espagne', distance: '11.3 km', difficulty: 'Modéré', rating: 4.7, runs: '5.6k', tag: 'Historique' },
  { img: '🌿', name: 'Parque das Nações Loop', city: 'Lisbonne, Portugal', distance: '8.7 km', difficulty: 'Facile', rating: 4.9, runs: '3.2k', tag: 'Bord de mer' },
];

const community = [
  { initials: 'SM', color: '#EA580C', name: 'Sophie M.', city: '🇯🇵 Tokyo', time: 'il y a 2h', title: 'Morning Run au Shinjuku Gyoen 🌸', dist: '12.0 km', pace: '5:15/km', likes: 34 },
  { initials: 'TR', color: '#047857', name: 'Thomas R.', city: '🇪🇸 Barcelone', time: 'il y a 4h', title: 'Fractionné sur la Rambla 💪', dist: '8.4 km', pace: '4:32/km', likes: 21 },
  { initials: 'LB', color: '#0E7490', name: 'Léa B.', city: '🇵🇹 Lisbonne', time: 'Hier', title: 'Trail Sintra au coucher de soleil 🌅', dist: '16.2 km', pace: '6:10/km', likes: 58 },
];

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <AppLayout title="Explorer">
      <div style={{ padding: '32px', maxWidth: '1200px', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Explorer 🌍
            </h1>
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>Découvrez spots, défis et la communauté Élan · 127 villes</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.2)', borderRadius: '999px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', fontFamily: '"Montserrat",sans-serif' }}>142 sportifs actifs</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} style={{ padding: '8px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', cursor: 'pointer', transition: 'all 0.2s ease', border: activeTab === i ? '1px solid #EA580C' : '1px solid #E5E1D0', background: activeTab === i ? 'linear-gradient(135deg,rgba(234,88,12,0.1),rgba(234,88,12,0.05))' : 'white', color: activeTab === i ? '#EA580C' : '#57534E' }}>{tab}</button>
          ))}
        </div>

        {/* Défis actifs */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trophy size={15} style={{ color: '#EA580C' }} />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Défis actifs</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {challenges.map((c, i) => (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '20px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = `0 4px 16px ${c.color}20`; el.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{c.emoji}</span>
                  <span style={{ fontSize: '18px' }}>{c.badge}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{c.title}</h3>
                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#57534E', lineHeight: 1.5 }}>{c.desc}</p>

                <div style={{ background: 'rgba(28,25,23,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', borderRadius: '999px', width: `${c.progress}%`, background: c.color, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#57534E', fontWeight: 600 }}><Users size={10} style={{ display: 'inline', marginRight: '3px' }} />{c.participants.toLocaleString()} participants</span>
                  <span style={{ color: c.color, fontWeight: 700 }}>{c.progress}% · J-{c.days}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Spots populaires */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Globe size={14} style={{ color: '#0E7490' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Spots populaires</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {spots.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#FAF8ED', borderRadius: '14px', border: '1px solid #E5E1D0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.3)'; el.style.background = 'white'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.background = '#FAF8ED'; }}
                >
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{s.img}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(4,120,87,0.1)', color: '#047857', fontWeight: 700, flexShrink: 0 }}>{s.tag}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#A8A29E' }}>{s.city} · {s.distance} · {s.difficulty}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '2px' }}>
                      <Star size={10} style={{ color: '#EA580C' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C' }}>{s.rating}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#A8A29E' }}>{s.runs} runs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Communauté */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={14} style={{ color: '#EA580C' }} />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Communauté</h3>
              </div>
              <span style={{ fontSize: '12px', color: '#EA580C', fontWeight: 600, cursor: 'pointer' }}>Voir tout →</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {community.map((u, i) => (
                <div key={i} style={{ padding: '14px 16px', background: '#FAF8ED', borderRadius: '14px', border: '1px solid #E5E1D0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.25)'; el.style.background = 'white'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.background = '#FAF8ED'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg,${u.color},#047857)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', fontFamily: '"Montserrat",sans-serif' }}>{u.initials}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{u.name}</span>
                        <span style={{ fontSize: '11px', color: '#A8A29E' }}>{u.city}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#A8A29E' }}>{u.time}</p>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#1C1917' }}>{u.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '14px' }}>
                      {[['📏', u.dist], ['⚡', u.pace]].map(([icon, val]) => (
                        <span key={val} style={{ fontSize: '12px', color: '#57534E', fontWeight: 600 }}>{icon} {val}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#A8A29E' }}>
                      <Heart size={12} />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{u.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
