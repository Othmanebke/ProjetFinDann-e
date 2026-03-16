'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
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
    { label: 'Km cette semaine', value: currentWeekStats?.distanceKm?.toFixed(1) ?? '0', unit: 'km', icon: Activity, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)',
      trend: prevWeekStats ? `${currentWeekStats!.distanceKm >= prevWeekStats.distanceKm ? '+' : ''}${(currentWeekStats!.distanceKm - prevWeekStats.distanceKm).toFixed(1)}km vs S-1` : '' },
    { label: 'Calories brûlées', value: (currentWeekStats?.calories ?? 0).toLocaleString(), unit: 'kcal', icon: Flame, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)', trend: '' },
    { label: 'Temps actif', value: currentWeekStats ? `${Math.floor(currentWeekStats.durationMin/60)}h${(currentWeekStats.durationMin%60).toString().padStart(2,'0')}` : '0h', unit: '', icon: Clock, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)', trend: '' },
    { label: 'Total km parcourus', value: stats?.totalDistanceKm?.toFixed(0) ?? '0', unit: 'km', icon: Map, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', trend: `${stats?.totalSessions ?? 0} séances` },
  ];

  const workoutTypeIcons: Record<string, string> = { RUN: '🏃', WALK: '🚶', CYCLE: '🚴', GYM: '💪', HIIT: '⚡', YOGA: '🧘', SWIM: '🏊' };

  return (
    <AppLayout>
      <div style={{ padding: '32px', maxWidth: '1200px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Bonjour {user?.name?.split(' ')[0] ?? 'Sportif'} 👋
            </h1>
            <p style={{ color: '#64748b', marginTop: '6px', fontSize: '14px' }}>
              {user?.currentCity ? `📍 ${user.currentCity}` : 'Prêt pour ta séance du jour ?'}
            </p>
          </div>
          <Link href="/workouts/new">
            <button className="btn-glow" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px' }}>
              <Plus size={14} /> Nouvelle séance
            </button>
          </Link>
        </div>

        {/* Weekly progress bar */}
        {user?.weeklyTargetKm && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa' }}>Objectif hebdomadaire</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{currentWeekStats?.distanceKm?.toFixed(1) ?? 0} / {user.weeklyTargetKm} km</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${weekProgress}%`, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', transition: 'width 1s ease', boxShadow: '0 0 12px rgba(139,92,246,0.5)' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0' }}>{weekProgress}% de l'objectif atteint</p>
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '32px' }}>
          {kpiCards.map(({ label, value, unit, icon: Icon, color, bg, border, trend }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{label}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                {loading ? '—' : value}<span style={{ fontSize: '14px', color: '#64748b', marginLeft: '4px' }}>{unit}</span>
              </div>
              {trend && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>{trend}</div>}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>

          {/* Distance chart */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <TrendingUp size={16} style={{ color: '#8b5cf6' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>Distance (8 semaines)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.weeklyData ?? []}>
                <defs>
                  <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} unit="km" />
                <Tooltip
                  contentStyle={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(v: any) => [`${v} km`, 'Distance']}
                />
                <Area type="monotone" dataKey="distanceKm" stroke="#8b5cf6" strokeWidth={2} fill="url(#distGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Calories chart */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Flame size={16} style={{ color: '#f43f5e' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>Calories (8 semaines)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.weeklyData ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} unit="kcal" />
                <Tooltip
                  contentStyle={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(v: any) => [`${v} kcal`, 'Calories']}
                />
                <Bar dataKey="calories" fill="#f43f5e" radius={[4,4,0,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent workouts */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>Séances récentes</h3>
            <Link href="/workouts" style={{ fontSize: '13px', color: '#8b5cf6', textDecoration: 'none' }}>Voir tout →</Link>
          </div>
          {loading ? (
            <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Chargement...</div>
          ) : recentWorkouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏃</div>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px' }}>Aucune séance enregistrée</p>
              <Link href="/workouts/new"><button className="btn-glow" style={{ fontSize: '13px', padding: '8px 20px' }}>Enregistrer ma première séance</button></Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentWorkouts.map((w: any) => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    {workoutTypeIcons[w.type] ?? '🏋️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{w.title ?? w.type}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{w.city ? `📍 ${w.city}` : ''} · {w.distanceKm > 0 ? `${w.distanceKm}km · ` : ''}{w.durationMin}min · {w.calories} kcal</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>S{w.weekNumber}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
