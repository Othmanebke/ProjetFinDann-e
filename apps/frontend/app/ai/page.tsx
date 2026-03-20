'use client';

import { useState } from 'react';
import { BrainCircuit, Target, Sparkles, Send, TrendingUp, Moon, Zap, MessageSquare } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const initialMessages = [
  {
    role: 'ai',
    text: 'Bonjour ! J\'ai analysé vos données de cette nuit. Votre VFC est à 68ms (+12% vs votre moyenne) et votre sommeil profond représente 24% du total — excellente récupération. 🟢',
    time: '07:02',
  },
  {
    role: 'ai',
    text: 'Vu vos courbatures aux mollets signalées hier, je vous recommande la séance de fractionné prévue mais avec un échauffement de 15 min supplémentaire et 2 répétitions de moins. Souhaitez-vous que j\'adapte l\'itinéraire en conséquence ?',
    time: '07:02',
  },
  {
    role: 'user',
    text: 'Oui, je préfère rester sur du plat aujourd\'hui.',
    time: '07:14',
  },
  {
    role: 'ai',
    text: 'C\'est noté ! J\'ai mis à jour votre itinéraire avec la "Boucle du Canal" (8.5 km, +20 m D+). Départ conseillé à 18h30 pour éviter la chaleur. Concentrez-vous sur le relâchement musculaire et la cadence > 170 ppm. Bon run ! 🏃‍♂️🔥',
    time: '07:15',
  },
];

const objectives = [
  { icon: '🎯', text: 'Maintenir cadence > 170 ppm', done: false },
  { icon: '💧', text: 'Hydratation +500ml avant run', done: true },
  { icon: '🧘', text: 'Étirements chaîne postérieure', done: false },
];

const insights = [
  { icon: Moon, label: 'Sommeil', value: '7h24', detail: '24% profond', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)' },
  { icon: TrendingUp, label: 'VFC', value: '68 ms', detail: '+12% vs moy.', color: '#047857', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.18)' },
  { icon: Zap, label: 'Forme', value: '92/100', detail: 'Excellente', color: '#EA580C', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.18)' },
];

export default function AiCoachPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      { role: 'user', text: input.trim(), time: now },
      { role: 'ai', text: 'Je prends en compte votre message et j\'analyse vos données en temps réel pour vous proposer les meilleurs conseils personnalisés...', time: now },
    ]);
    setInput('');
  };

  return (
    <AppLayout title="Coach IA">
      <div style={{ padding: '32px', maxWidth: '1200px', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em', fontFamily: '"Montserrat",sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#EA580C,#C2410C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit size={18} style={{ color: 'white' }} />
              </div>
              Coach IA
            </h1>
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>Assistant personnel · Disponible 24h/24</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(4,120,87,0.08)', border: '1px solid rgba(4,120,87,0.2)', borderRadius: '999px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#047857', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', fontFamily: '"Montserrat",sans-serif' }}>En ligne</span>
          </div>
        </div>

        {/* Données biométriques du jour */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
          {insights.map(({ icon: Icon, label, value, detail, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#57534E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: '"Montserrat",sans-serif' }}>{label}</p>
                <p style={{ margin: '2px 0 1px', fontSize: '20px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.02em', fontFamily: '"Montserrat",sans-serif' }}>{value}</p>
                <p style={{ margin: 0, fontSize: '11px', color: color, fontWeight: 600 }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

          {/* Chat */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 4px rgba(28,25,23,0.05)', minHeight: '500px' }}>

            {/* Messages */}
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {messages.map((msg, i) => {
                const isAi = msg.role === 'ai';
                return (
                  <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: isAi ? 'row' : 'row-reverse', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isAi ? 'linear-gradient(135deg,#EA580C,#C2410C)' : 'linear-gradient(135deg,#EA580C,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isAi ? <BrainCircuit size={14} style={{ color: 'white' }} /> : <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>M</span>}
                    </div>
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{ padding: '12px 16px', borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: isAi ? '#FAF8ED' : 'linear-gradient(135deg,rgba(234,88,12,0.12),rgba(234,88,12,0.06))', border: `1px solid ${isAi ? '#E5E1D0' : 'rgba(234,88,12,0.2)'}`, fontSize: '13px', color: '#1C1917', lineHeight: 1.6 }}>
                        {msg.text}
                      </div>
                      <p style={{ margin: '4px 6px 0', fontSize: '10px', color: '#A8A29E', textAlign: isAi ? 'left' : 'right' }}>{msg.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggestions rapides */}
            <div style={{ padding: '12px 24px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Adapter mon entraînement', 'Recette post-run', 'Analyser ma semaine'].map(s => (
                <button key={s} onClick={() => setInput(s)} style={{ padding: '6px 12px', borderRadius: '999px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '12px', color: '#57534E', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: '"Montserrat",sans-serif' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(234,88,12,0.3)'; el.style.color = '#EA580C'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#E5E1D0'; el.style.color = '#57534E'; }}
                >{s}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E1D0', display: 'flex', gap: '10px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Demandez un conseil, une adaptation, une recette..."
                style={{ flex: 1, padding: '10px 16px', borderRadius: '999px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none', fontFamily: '"Inter",sans-serif', transition: 'border-color 0.2s ease' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(234,88,12,0.4)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E1D0'; }}
              />
              <button onClick={send} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#EA580C,#C2410C)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.3)', flexShrink: 0 }}>
                <Send size={15} style={{ color: 'white' }} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Objectifs dynamiques */}
            <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <Target size={14} style={{ color: '#EA580C' }} />
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Objectifs du jour</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {objectives.map((obj, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#FAF8ED', borderRadius: '10px', border: '1px solid #E5E1D0' }}>
                    <span style={{ fontSize: '16px' }}>{obj.icon}</span>
                    <span style={{ fontSize: '12px', color: obj.done ? '#047857' : '#57534E', textDecoration: obj.done ? 'line-through' : 'none', flex: 1, fontWeight: 600 }}>{obj.text}</span>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: obj.done ? '#047857' : 'transparent', border: `2px solid ${obj.done ? '#047857' : '#E5E1D0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {obj.done && <span style={{ color: 'white', fontSize: '9px', fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyse IA */}
            <div style={{ background: 'linear-gradient(135deg,rgba(234,88,12,0.08),rgba(4,120,87,0.06))', border: '1px solid rgba(234,88,12,0.2)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={14} style={{ color: '#EA580C' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', fontFamily: '"Montserrat",sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Analyse IA</span>
              </div>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>92<span style={{ fontSize: '16px', color: '#A8A29E', fontWeight: 400 }}>/100</span></p>
              <p style={{ margin: '4px 0 12px', fontSize: '13px', fontWeight: 700, color: '#047857' }}>Excellente récupération 🟢</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#57534E', lineHeight: 1.6 }}>
                Conditions optimales pour un entraînement intensif. Votre corps est prêt à absorber une charge élevée aujourd'hui.
              </p>
            </div>

            {/* Séance suggérée */}
            <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                <MessageSquare size={14} style={{ color: '#047857' }} />
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Séance suggérée</h3>
              </div>
              <div style={{ background: '#FAF8ED', borderRadius: '12px', padding: '14px', border: '1px solid #E5E1D0' }}>
                <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 800, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>Fractionné court 6×400m</p>
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#57534E' }}>Boucle du Canal · 8.5 km · ~50 min</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['18h30', 'Plat', 'Allure 4:15/km'].map(t => (
                    <span key={t} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(234,88,12,0.1)', color: '#EA580C', fontWeight: 700 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
