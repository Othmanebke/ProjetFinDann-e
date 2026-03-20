'use client';

import { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Target, Sparkles, Send, TrendingUp, Moon, Zap, Plus, MessageSquare, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Message { id?: string; role: 'user' | 'assistant'; content: string; }
interface Chat { id: string; title: string; messages: Message[]; updatedAt: string; }

const QUICK_PROMPTS = [
  'Adapter mon entraînement de ce soir',
  'Recette post-run riche en protéines',
  'Analyser ma semaine sportive',
  'Meilleur parcours à Paris demain matin',
];

const insights = [
  { icon: Moon, label: 'Sommeil', value: '7h24', detail: '24% profond', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)' },
  { icon: TrendingUp, label: 'VFC', value: '68 ms', detail: '+12% vs moy.', color: '#047857', bg: 'rgba(4,120,87,0.08)', border: 'rgba(4,120,87,0.18)' },
  { icon: Zap, label: 'Forme', value: '92/100', detail: 'Excellente', color: '#EA580C', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.18)' },
];

export default function AiCoachPage() {
  const { accessToken } = useAuthStore();
  const isDemo = accessToken === 'demo-access-token';

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo messages
  const DEMO_MESSAGES: Message[] = [
    { role: 'assistant', content: 'Bonjour ! J\'ai analysé vos données de cette nuit. Votre VFC est à 68ms (+12% vs votre moyenne) — excellente récupération. 🟢 Prêt pour un effort intense aujourd\'hui !' },
    { role: 'assistant', content: 'Je vous recommande la séance de fractionné prévue avec un échauffement de 15 min. Souhaitez-vous que j\'adapte l\'itinéraire ?' },
    { role: 'user', content: 'Oui, je préfère rester sur du plat aujourd\'hui.' },
    { role: 'assistant', content: 'C\'est noté ! J\'ai mis à jour votre itinéraire avec la "Boucle du Canal" (8.5 km, +20m D+). Départ conseillé à 18h30. Bon run ! 🏃‍♂️🔥' },
  ];

  useEffect(() => {
    if (isDemo) {
      setMessages(DEMO_MESSAGES);
      setLoadingChats(false);
      return;
    }
    loadChats();
  }, [isDemo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadChats() {
    try {
      const { data } = await api.get('/ai/chats');
      setChats(data);
      if (data.length > 0) {
        setActiveChatId(data[0].id);
        setMessages(data[0].messages ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingChats(false);
    }
  }

  async function newChat() {
    if (isDemo) { setMessages([]); return; }
    try {
      const { data } = await api.post('/ai/chats', { title: 'Nouvelle conversation' });
      setChats(prev => [data, ...prev]);
      setActiveChatId(data.id);
      setMessages([]);
    } catch { /* ignore */ }
  }

  async function selectChat(chat: Chat) {
    setActiveChatId(chat.id);
    setMessages(chat.messages ?? []);
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    // Mode démo : réponse simulée
    if (isDemo) {
      setStreaming(true);
      const aiMsg: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, aiMsg]);
      const response = `En tant que Coach IA, voici mon analyse pour "${msg}" : basé sur vos données de récupération (VFC 68ms, forme 92/100), je vous recommande d'adapter l'intensité à 80% de votre FC max. Restez hydraté et profitez de votre séance ! 💪`;
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: response.slice(0, i * 3) };
          return updated;
        });
        if (i * 3 >= response.length) {
          clearInterval(interval);
          setStreaming(false);
        }
      }, 30);
      return;
    }

    // Créer un chat si aucun
    let chatId = activeChatId;
    if (!chatId) {
      try {
        const { data } = await api.post('/ai/chats', { title: msg.slice(0, 50) });
        chatId = data.id;
        setActiveChatId(data.id);
        setChats(prev => [data, ...prev]);
      } catch { return; }
    }

    setStreaming(true);
    const aiMsg: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, aiMsg]);

    try {
      const token = useAuthStore.getState().accessToken;
      const response = await fetch(`${API_URL}/ai/chats/${chatId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: msg }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const raw = line.replace('data: ', '');
          if (raw === '[DONE]') break;
          try {
            const { delta } = JSON.parse(raw);
            if (delta) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: updated[updated.length - 1].content + delta,
                };
                return updated;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Erreur de connexion au Coach IA. Vérifiez que le serveur est démarré.' };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

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
            <p style={{ color: '#57534E', marginTop: '6px', fontSize: '14px' }}>Assistant personnel · GPT-4o · Disponible 24h/24</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(4,120,87,0.08)', border: '1px solid rgba(4,120,87,0.2)', borderRadius: '999px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#047857', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', fontFamily: '"Montserrat",sans-serif' }}>En ligne</span>
          </div>
        </div>

        {/* Données biométriques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
          {insights.map(({ icon: Icon, label, value, detail, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '16px', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#57534E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: '"Montserrat",sans-serif' }}>{label}</p>
                <p style={{ margin: '2px 0 1px', fontSize: '20px', fontWeight: 900, color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{value}</p>
                <p style={{ margin: 0, fontSize: '11px', color, fontWeight: 600 }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>

          {/* Liste des conversations */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '16px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '560px', overflow: 'hidden' }}>
            <button onClick={newChat} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 12px', background: 'linear-gradient(135deg,rgba(234,88,12,0.1),rgba(234,88,12,0.05))', border: '1px solid rgba(234,88,12,0.2)', borderRadius: '10px', color: '#EA580C', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Montserrat",sans-serif', width: '100%' }}>
              <Plus size={13} /> Nouvelle conversation
            </button>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {loadingChats ? (
                <p style={{ fontSize: '12px', color: '#A8A29E', textAlign: 'center', padding: '16px 0' }}>Chargement…</p>
              ) : chats.length === 0 && !isDemo ? (
                <p style={{ fontSize: '12px', color: '#A8A29E', textAlign: 'center', padding: '16px 0' }}>Aucune conversation</p>
              ) : isDemo ? (
                <div style={{ padding: '10px', background: '#FAF8ED', borderRadius: '10px', border: '1px solid rgba(234,88,12,0.2)', cursor: 'pointer' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#1C1917' }}>Session démo</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#A8A29E' }}>Conversation active</p>
                </div>
              ) : chats.map(chat => (
                <div key={chat.id} onClick={() => selectChat(chat)} style={{ padding: '10px', background: activeChatId === chat.id ? 'rgba(234,88,12,0.08)' : '#FAF8ED', borderRadius: '10px', border: `1px solid ${activeChatId === chat.id ? 'rgba(234,88,12,0.25)' : '#E5E1D0'}`, cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#A8A29E' }}>{new Date(chat.updatedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Zone de chat principale */}
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 4px rgba(28,25,23,0.05)', minHeight: '560px' }}>

            {/* Messages */}
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '400px' }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,rgba(234,88,12,0.15),rgba(234,88,12,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrainCircuit size={24} style={{ color: '#EA580C' }} />
                  </div>
                  <p style={{ textAlign: 'center', color: '#57534E', fontSize: '14px', margin: 0 }}>Commencez une conversation avec votre Coach IA</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isAi = msg.role === 'assistant';
                return (
                  <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: isAi ? 'row' : 'row-reverse', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isAi ? 'linear-gradient(135deg,#EA580C,#C2410C)' : 'linear-gradient(135deg,#EA580C,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isAi ? <BrainCircuit size={14} style={{ color: 'white' }} /> : <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>M</span>}
                    </div>
                    <div style={{ maxWidth: '75%' }}>
                      <div style={{ padding: '12px 16px', borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: isAi ? '#FAF8ED' : 'linear-gradient(135deg,rgba(234,88,12,0.12),rgba(234,88,12,0.06))', border: `1px solid ${isAi ? '#E5E1D0' : 'rgba(234,88,12,0.2)'}`, fontSize: '13px', color: '#1C1917', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                        {isAi && streaming && i === messages.length - 1 && <span style={{ display: 'inline-block', width: '6px', height: '14px', background: '#EA580C', marginLeft: '2px', animation: 'blink 1s step-end infinite', borderRadius: '1px' }} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions rapides */}
            <div style={{ padding: '12px 24px 0', display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #F5F3E7' }}>
              {QUICK_PROMPTS.map(s => (
                <button key={s} onClick={() => send(s)} disabled={streaming} style={{ padding: '6px 12px', borderRadius: '999px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '11px', color: '#57534E', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: '"Montserrat",sans-serif', opacity: streaming ? 0.5 : 1 }}
                  onMouseEnter={e => { if (!streaming) { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(234,88,12,0.3)'; el.style.color = '#EA580C'; } }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#E5E1D0'; el.style.color = '#57534E'; }}
                >{s}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '16px 24px', display: 'flex', gap: '10px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Demandez un conseil, une adaptation, une recette…"
                disabled={streaming}
                style={{ flex: 1, padding: '10px 16px', borderRadius: '999px', border: '1px solid #E5E1D0', background: '#FAF8ED', fontSize: '13px', color: '#1C1917', outline: 'none', fontFamily: '"Inter",sans-serif', transition: 'border-color 0.2s ease', opacity: streaming ? 0.7 : 1 }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(234,88,12,0.4)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E1D0'; }}
              />
              <button onClick={() => send()} disabled={streaming || !input.trim()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#EA580C,#C2410C)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.3)', flexShrink: 0, opacity: streaming || !input.trim() ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                <Send size={15} style={{ color: 'white' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </AppLayout>
  );
}
