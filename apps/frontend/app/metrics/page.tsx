'use client';

import { Activity, Heart, Zap, TrendingUp, TrendingDown, BarChart3, Clock, Flame, Target, Calendar } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const kpis = [
  { label: 'VO2 Max', value: '52', unit: 'ml/kg/min', trend: '+1.2', trendUp: true, icon: Activity, color: '#EA580C', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.18)' },
  { label: 'Allure moyenne', value: '4:45', unit: '/km', trend: '-0:15 ce mois', trendUp: true, icon: Zap, color: '#047857', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.18)' },
  { label: 'FC au repos', value: '48', unit: 'bpm', trend: '-2 bpm', trendUp: true, icon: Heart, color: '#DC2626', bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.15)' },
  { label: 'Charge hebdo', value: '1 840', unit: 'pts', trend: '+150 pts', trendUp: true, icon: Target, color: '#7C3AED', bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.15)' },
];

const weeklyData = [
  { label: 'S-7', dist: 18, calories: 1200, sessions: 2 },
  { label: 'S-6', dist: 32, calories: 2100, sessions: 4 },
  { label: 'S-5', dist: 25, calories: 1680, sessions: 3 },
  { label: 'S-4', dist: 41, calories: 2700, sessions: 5 },
  { label: 'S-3', dist: 38, calories: 2480, sessions: 4 },
  { label: 'S-2', dist: 45, calories: 2950, sessions: 5 },
  { label: 'S-1', dist: 52, calories: 3350, sessions: 6 },
  { label: 'Cette S.', dist: 37, calories: 2400, sessions: 4 },
];

const heartZones = [
  { zone: 'Z5 Maximal', range: '> 185 bpm', time: '12 min', pct: 5, color: '#DC2626' },
  { zone: 'Z4 Seuil', range: '167–185 bpm', time: '45 min', pct: 18, color: '#EA580C' },
  { zone: 'Z3 Aérobie', range: '149–166 bpm', time: '1h 20', pct: 32, color: '#D97706' },
  { zone: 'Z2 Endurance', range: '130–148 bpm', time: '2h 15', pct: 38, color: '#047857' },
  { zone: 'Z1 Récup', range: '< 130 bpm', time: '28 min', pct: 7, color: '#0E7490' },
];

const maxDist = Math.max(...weeklyData.map(d => d.dist));

export default function MetricsPage() {
  return (
    <AppLayout title="Performance">
      <div style={{ padding: '32px', maxWidth: '1200px', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>
              Performance 📊
            </h1>
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>Analyses biométriques et progression · 8 semaines</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['4S', '8S', '3M', '6M'].map((p, i) => (
              <button key={p} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', cursor: 'pointer', border: i === 1 ? '1px solid #EA580C' : '1px solid #E5E1D0', background: i === 1 ? 'rgba(234,88,12,0.08)' : 'white', color: i === 1 ? '#EA580C' : '#57534E' }}>{p}</button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
          {kpis.map(({ label, value, unit, trend, trendUp, icon: Icon, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: '#57534E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: '"Montserrat",sans-serif' }}>{label}</span>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>
                {value}<span style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 400, marginLeft: '4px' }}>{unit}</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {trendUp ? <TrendingUp size={11} style={{ color: '#047857' }} /> : <TrendingDown size={11} style={{ color: '#DC2626' }} />}
                <span style={{ fontSize: '11px', fontWeight: 600, color: trendUp ? '#047857' : '#DC2626' }}>{trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Graphique distance */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <TrendingUp size={15} style={{ color: '#EA580C' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Distance hebdomadaire (km)</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px' }}>
              {weeklyData.map((d, i) => {
                const height = Math.round((d.dist / maxDist) * 100);
                const isLast = i === weeklyData.length - 1;
                return (
                  <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isLast ? '#EA580C' : '#A8A29E' }}>{d.dist}</span>
                    <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: isLast ? 'linear-gradient(180deg,#EA580C,#D97706)' : 'rgba(234,88,12,0.2)', height: `${height}%`, transition: 'height 0.6s ease', boxShadow: isLast ? '0 -2px 8px rgba(234,88,12,0.3)' : 'none' }} />
                    <span style={{ fontSize: '9px', color: '#A8A29E', fontWeight: 600, whiteSpace: 'nowrap' }}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zones cardiaques */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Heart size={15} style={{ color: '#DC2626' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Temps par zone cardiaque</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {heartZones.map((z) => (
                <div key={z.zone} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: z.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C1917' }}>{z.zone}</span>
                      <span style={{ fontSize: '12px', color: '#57534E', fontWeight: 600 }}>{z.time}</span>
                    </div>
                    <div style={{ background: '#F5F3E7', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '999px', width: `${z.pct}%`, background: z.color, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#A8A29E', width: '28px', textAlign: 'right' }}>{z.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé séances + progression */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>

          {/* Séances semaine */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Calendar size={14} style={{ color: '#0E7490' }} />
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Semaine en cours</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[['4', 'Séances'], ['37.4 km', 'Distance'], ['2h 18', 'Actif'], ['1 840', 'Calories']].map(([v, l]) => (
                <div key={l} style={{ background: '#FAF8ED', borderRadius: '12px', padding: '12px', border: '1px solid #E5E1D0' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{v}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#A8A29E', fontWeight: 600 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Objectifs */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Target size={14} style={{ color: '#047857' }} />
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Objectifs mensuels</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Distance', current: 148, target: 200, unit: 'km', color: '#EA580C' },
                { label: 'Séances', current: 14, target: 20, unit: '', color: '#047857' },
                { label: 'Calories', current: 9200, target: 15000, unit: 'kcal', color: '#7C3AED' },
              ].map(({ label, current, target, unit, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#57534E' }}>{label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C1917' }}>{current}{unit} / {target}{unit}</span>
                  </div>
                  <div style={{ background: '#F5F3E7', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', width: `${Math.round((current / target) * 100)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allure trends */}
          <div style={{ background: 'linear-gradient(135deg,rgba(234,88,12,0.08),rgba(4,120,87,0.06))', border: '1px solid rgba(234,88,12,0.2)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Zap size={14} style={{ color: '#EA580C' }} />
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Progression allure</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Allure actuelle', value: '4:45/km', delta: '▼ 15s vs mois dernier', positive: true },
                { label: 'Meilleure allure', value: '4:02/km', delta: '10km · 14 mars', positive: true },
                { label: 'Allure marathon', value: '5:10/km', delta: 'Prévision actuelle', positive: false },
                { label: 'FC seuil', value: '173 bpm', delta: '▼ 3 bpm en 2 mois', positive: true },
              ].map(({ label, value, delta, positive }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(234,88,12,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#57534E', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{value}</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: positive ? '#047857' : '#A8A29E', fontWeight: 600 }}>{delta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
