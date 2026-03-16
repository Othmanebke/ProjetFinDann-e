'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Activity, Map, Flame, Clock, TrendingUp, Plus, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Link from 'next/link';

interface WeeklyStats {
  weekNumber: number; yearNumber: number; label: string;
  distanceKm: number; durationMin: number; calories: number; sessions: number;
}
interface Stats {
  totalDistanceKm: number; totalDurationMin: number; totalCalories: number;
  totalSessions: number; weeklyData: WeeklyStats[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/workouts/stats?weeks=8'),
      api.get('/api/workouts?limit=5'),
    ]).then(([statsRes, workoutsRes]) => {
      setStats(statsRes.data);
      setRecentWorkouts(workoutsRes.data.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const currentWeekStats = stats?.weeklyData?.[stats.weeklyData.length - 1];
  const prevWeekStats = stats?.weeklyData?.[stats.weeklyData.length - 2];
  const weekProgress = currentWeekStats && user?.weeklyTargetKm
    ? Math.min(100, Math.round((currentWeekStats.distanceKm / user.weeklyTargetKm) * 100))
    : 0;

  const kpiCards = [
    { label: 'Km cette semaine', value: currentWeekStats?.distanceKm?.toFixed(1) ?? '0', unit: 'km', icon: Activity, color: '#EA580C', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.18)',
      trend: prevWeekStats ? `${currentWeekStats!.distanceKm >= prevWeekStats.distanceKm ? '+' : ''}${(currentWeekStats!.distanceKm - prevWeekStats.distanceKm).toFixed(1)}km vs S-1` : '' },
    { label: 'Calories brûlées', value: (currentWeekStats?.calories ?? 0).toLocaleString(), unit: 'kcal', icon: Flame, color: '#DC2626', bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.15)', trend: '' },
    { label: 'Temps actif', value: currentWeekStats ? `${Math.floor(currentWeekStats.durationMin/60)}h${(currentWeekStats.durationMin%60).toString().padStart(2,'0')}` : '0h', unit: '', icon: Clock, color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.18)', trend: '' },
    { label: 'Total km parcourus', value: stats?.totalDistanceKm?.toFixed(0) ?? '0', unit: 'km', icon: Map, color: '#047857', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.18)', trend: `${stats?.totalSessions ?? 0} séances` },
  ];

  const workoutTypeIcons: Record<string, string> = { RUN: '🏃', WALK: '🚶', CYCLE: '🚴', GYM: '💪', HIIT: '⚡', YOGA: '🧘', SWIM: '🏊' };

  return (
    <AppLayout>
      <div style={{ padding: '32px', maxWidth: '1200px', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>
              Bonjour {user?.name?.split(' ')[0] ?? 'Sportif'} 👋
            </h1>
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>
              {user?.currentCity ? `📍 ${user.currentCity}` : 'Prêt pour ta séance du jour ?'}
            </p>
          </div>
          <Link href="/workouts/new">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px' }}>
              <Plus size={14} /> Nouvelle séance
            </button>
          </Link>
        </div>

        {/* Weekly progress bar */}
        {user?.weeklyTargetKm && (
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#EA580C', fontFamily: '"Montserrat",sans-serif' }}>Objectif hebdomadaire</span>
              <span style={{ fontSize: '13px', color: '#57534E' }}>{currentWeekStats?.distanceKm?.toFixed(1) ?? 0} / {user.weeklyTargetKm} km</span>
            </div>
            <div style={{ background: '#F5F3E7', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${weekProgress}%`, background: 'linear-gradient(90deg,#EA580C,#D97706)', transition: 'width 1s ease', boxShadow: '0 0 8px rgba(234,88,12,0.4)' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#A8A29E', margin: '8px 0 0' }}>{weekProgress}% de l'objectif atteint</p>
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '32px' }}>
          {kpiCards.map(({ label, value, unit, icon: Icon, color, bg, border, trend }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(28,25,23,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#57534E', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif' }}>
                {loading ? '—' : value}<span style={{ fontSize: '14px', color: '#A8A29E', marginLeft: '4px', fontWeight: 400, fontFamily: '"Inter",sans-serif' }}>{unit}</span>
              </div>
              {trend && <div style={{ fontSize: '11px', color: '#57534E', marginTop: '6px', fontWeight: 600 }}>{trend}</div>}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>

          {/* Distance chart */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <TrendingUp size={16} style={{ color: '#EA580C' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Distance (8 semaines)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.weeklyData ?? []}>
                <defs>
                  <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F3E7" />
                <XAxis dataKey="label" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} unit="km" />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '10px', color: '#1C1917', fontSize: '12px', boxShadow: '0 4px 16px rgba(28,25,23,0.1)' }}
                  formatter={(v: any) => [`${v} km`, 'Distance']}
                />
                <Area type="monotone" dataKey="distanceKm" stroke="#EA580C" strokeWidth={2.5} fill="url(#distGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Calories chart */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Flame size={16} style={{ color: '#047857' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Calories (8 semaines)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.weeklyData ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F3E7" />
                <XAxis dataKey="label" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} unit="kcal" />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '10px', color: '#1C1917', fontSize: '12px', boxShadow: '0 4px 16px rgba(28,25,23,0.1)' }}
                  formatter={(v: any) => [`${v} kcal`, 'Calories']}
                />
                <Bar dataKey="calories" fill="#047857" radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent workouts */}
        <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Séances récentes</h3>
            <Link href="/workouts" style={{ fontSize: '13px', color: '#EA580C', textDecoration: 'none', fontWeight: 600 }}>Voir tout →</Link>
          </div>
          {loading ? (
            <div style={{ color: '#A8A29E', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Chargement...</div>
          ) : recentWorkouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏃</div>
              <p style={{ color: '#57534E', fontSize: '14px', margin: '0 0 16px' }}>Aucune séance enregistrée</p>
              <Link href="/workouts/new"><button className="btn-primary" style={{ fontSize: '13px', padding: '8px 20px' }}>Enregistrer ma première séance</button></Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentWorkouts.map((w: any) => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#FAF8ED', borderRadius: '12px', border: '1px solid #E5E1D0', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(234,88,12,0.3)'; el.style.background = 'white'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = '#E5E1D0'; el.style.background = '#FAF8ED'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(234,88,12,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {workoutTypeIcons[w.type] ?? '🏋️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{w.title ?? w.type}</div>
                    <div style={{ fontSize: '12px', color: '#A8A29E' }}>{w.city ? `📍 ${w.city}` : ''} · {w.distanceKm > 0 ? `${w.distanceKm}km · ` : ''}{w.durationMin}min · {w.calories} kcal</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#A8A29E', fontWeight: 600 }}>S{w.weekNumber}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
