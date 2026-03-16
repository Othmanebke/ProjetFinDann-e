'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/api';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const TYPES = ['RUN','WALK','CYCLE','GYM','HIIT','YOGA','SWIM'];
const TYPE_LABELS: Record<string,string> = { RUN:'Course 🏃', WALK:'Marche 🚶', CYCLE:'Vélo 🚴', GYM:'Muscu 💪', HIIT:'HIIT ⚡', YOGA:'Yoga 🧘', SWIM:'Natation 🏊' };

export default function NewWorkoutPage() {
  const router = useRouter();
  const [form, setForm] = useState({ type: 'RUN', durationMin: '', distanceKm: '', calories: '', heartRateAvg: '', city: '', country: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.durationMin) return setError('La durée est requise');
    setSaving(true);
    try {
      await api.post('/api/workouts', {
        type: form.type,
        durationMin: parseInt(form.durationMin),
        distanceKm: form.distanceKm ? parseFloat(form.distanceKm) : 0,
        calories: form.calories ? parseInt(form.calories) : 0,
        heartRateAvg: form.heartRateAvg ? parseInt(form.heartRateAvg) : undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        notes: form.notes || undefined,
      });
      router.push('/workouts');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur');
    } finally { setSaving(false); }
  };

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' as const };
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'block' };

  return (
    <AppLayout>
      <div style={{ padding: '32px', maxWidth: '600px' }}>
        <Link href="/workouts" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={14} /> Retour aux séances
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', margin: '0 0 24px' }}>Nouvelle Séance 💪</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Type */}
          <div>
            <label style={labelStyle}>Type d'activité *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
              {TYPES.map(t => (
                <button type="button" key={t} onClick={() => set('type', t)} style={{
                  padding: '10px 6px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
                  background: form.type === t ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                  borderColor: form.type === t ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)',
                  color: form.type === t ? '#a78bfa' : '#64748b',
                }}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Durée (min) *</label>
              <input type="number" min="1" value={form.durationMin} onChange={e => set('durationMin', e.target.value)} style={inputStyle} placeholder="30" required />
            </div>
            <div>
              <label style={labelStyle}>Distance (km)</label>
              <input type="number" step="0.1" min="0" value={form.distanceKm} onChange={e => set('distanceKm', e.target.value)} style={inputStyle} placeholder="5.0" />
            </div>
            <div>
              <label style={labelStyle}>Calories brûlées</label>
              <input type="number" min="0" value={form.calories} onChange={e => set('calories', e.target.value)} style={inputStyle} placeholder="300" />
            </div>
            <div>
              <label style={labelStyle}>FC moyenne (bpm)</label>
              <input type="number" min="40" max="220" value={form.heartRateAvg} onChange={e => set('heartRateAvg', e.target.value)} style={inputStyle} placeholder="145" />
            </div>
            <div>
              <label style={labelStyle}>Ville</label>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} placeholder="Paris" />
            </div>
            <div>
              <label style={labelStyle}>Pays</label>
              <input type="text" value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle} placeholder="France" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} placeholder="Sensations, météo, commentaires..." />
          </div>

          {error && <div style={{ color: '#f43f5e', fontSize: '13px', padding: '10px 14px', background: 'rgba(244,63,94,0.1)', borderRadius: '8px' }}>{error}</div>}

          <button type="submit" disabled={saving} className="btn-glow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
            <Save size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer la séance'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
