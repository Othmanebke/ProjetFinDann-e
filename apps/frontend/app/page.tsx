'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield, BarChart3, Brain, Users, ArrowRight,
  Star, Sparkles, TrendingUp,
  Bell, Play, CheckCircle2,
  Kanban, Bot, CreditCard, Activity, GitBranch, Layers,
  Zap, Lock, Globe, MessageSquare, Code2, ChevronDown,
  Check, X, Minus, Mail, Github, Slack, Figma
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════════════ */

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-scale').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

/* ═══════════════════════════════════════════════════════════════
   CANVAS PARTICLE SYSTEM
══════════════════════════════════════════════════════════════════ */

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;

    const NUM = 90;
    const MAX_DIST = 140;

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      r: number; a: number;
    }

    const particles: Particle[] = Array.from({ length: NUM }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.6 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < NUM; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.a})`;
        ctx.fill();

        for (let j = i + 1; j < NUM; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.25;
            const t = dist / MAX_DIST;
            const r = Math.round(139 + (6 - 139) * t);
            const g = Math.round(92 + (182 - 92) * t);
            const b = Math.round(246 + (212 - 246) * t);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.7 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   COUNTER
══════════════════════════════════════════════════════════════════ */

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min((now - t0) / 1800, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [started, target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════════════════════════════ */

function useTypewriter(phrases: string[], speed = 60, pauseMs = 2000) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx(i => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pauseMs]);

  return displayed;
}

/* ═══════════════════════════════════════════════════════════════
   TERMINAL AI DEMO
══════════════════════════════════════════════════════════════════ */

const TERMINAL_LINES = [
  { type: 'prompt', text: '$ fittravel generate --city "Barcelona" --type run --km 8' },
  { type: 'output', text: 'Analyzing city map and landmarks...' },
  { type: 'output', text: 'Connecting to GPT-4o engine...' },
  { type: 'success', text: '✓ Route generated in 1.4s' },
  { type: 'highlight', text: '' },
  { type: 'highlight', text: '🗺️  ROUTE: Barceloneta Coastal Run — 8.2km' },
  { type: 'output', text: '─────────────────────────────────────' },
  { type: 'cmd', text: 'Waypoints (4 points d\'intérêt)' },
  { type: 'output', text: '  📍 Barceloneta Beach (start)' },
  { type: 'output', text: '  📍 Port Olímpic — Olympic marina' },
  { type: 'output', text: '  📍 Parc de la Ciutadella' },
  { type: 'cmd', text: 'Infos pratiques' },
  { type: 'output', text: '  ⏱  ~50 min · Niveau: Facile' },
  { type: 'output', text: '  🛡️  Safety score: 9/10' },
  { type: 'output', text: '  ☀️  Meilleure heure: 7h-9h matin' },
  { type: 'cmd', text: 'Nutrition post-run recommandée' },
  { type: 'output', text: '  🍽️  La Cova Fumada — Bomba & Seafood' },
  { type: 'success', text: '✓ 38g protéines · 520 kcal · Note: 4.8★' },
  { type: 'success', text: '→ Parfait pour récupération musculaire' },
];

function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (visibleLines >= TERMINAL_LINES.length) return;
    const delay = TERMINAL_LINES[visibleLines].type === 'output' ? 120 : 200;
    const t = setTimeout(() => setVisibleLines(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [started, visibleLines]);

  const colorMap: Record<string, string> = {
    prompt: '#8b5cf6',
    cmd: '#22d3ee',
    output: '#64748b',
    success: '#10b981',
    highlight: '#f8fafc',
  };

  return (
    <div ref={ref} className="terminal">
      <div className="terminal-header">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span style={{ marginLeft: 12, fontSize: 12, color: '#475569' }}>fit-travel — coach IA terminal</span>
      </div>
      <div className="terminal-body">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ color: colorMap[line.type], opacity: 1, animation: 'fadeInUp 0.2s ease' }}>
            {line.text || '\u00A0'}
          </div>
        ))}
        {visibleLines < TERMINAL_LINES.length && (
          <span className="typewriter-cursor" />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BENTO CHAT CARD
══════════════════════════════════════════════════════════════════ */

const CHAT_MESSAGES = [
  { role: 'user', text: 'Génère un run de 8km à Tokyo passant par les temples' },
  { role: 'ai', text: 'Analyse des quartiers et points d\'intérêt de Tokyo...' },
  { role: 'ai', text: 'Parcours prêt ! 8.3km · Sensoji → Ueno Park → Akihabara. Score sécurité: 9/10 🟢' },
  { role: 'user', text: 'Que manger après pour la récupération ?' },
  { role: 'ai', text: 'Je recommande le "Chicken Ramen" au restaurant Ichiran Shibuya : 42g protéines, 520 kcal. Parfait pour la récup musculaire post-run !' },
];

function BentoChatCard() {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (visibleCount >= CHAT_MESSAGES.length) return;
    const t = setTimeout(() => setVisibleCount(v => v + 1), visibleCount === 0 ? 600 : 1400);
    return () => clearTimeout(t);
  }, [started, visibleCount]);

  return (
    <div ref={ref} className="h-full flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
          <Bot size={14} style={{ color: '#a78bfa' }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>AI Assistant</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'pulseRing 1.5s ease-out infinite' }} />
          <span className="text-xs" style={{ color: '#10b981' }}>Live</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        {CHAT_MESSAGES.slice(0, visibleCount).map((msg, i) => (
          <div
            key={i}
            style={{ animation: 'fadeInUp 0.3s ease', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'rgba(139,92,246,0.25)'
                  : 'rgba(255,255,255,0.04)',
                border: msg.role === 'user'
                  ? '1px solid rgba(139,92,246,0.35)'
                  : '1px solid rgba(255,255,255,0.08)',
                fontSize: 12,
                lineHeight: 1.5,
                color: msg.role === 'user' ? '#e2d9f3' : '#94a3b8',
              }}
            >
              {msg.text}
              {i === visibleCount - 1 && visibleCount < CHAT_MESSAGES.length && msg.role === 'ai' && (
                <span className="typewriter-cursor" />
              )}
            </div>
          </div>
        ))}
        {visibleCount < CHAT_MESSAGES.length && visibleCount > 0 && CHAT_MESSAGES[visibleCount].role === 'ai' && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12 }}>
              <span className="typewriter-cursor" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC BUTTON
══════════════════════════════════════════════════════════════════ */

function MagneticButton({ children, className, style, onClick }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  }, []);

  return (
    <div
      ref={ref}
      className={`magnetic-btn ${className ?? ''}`}
      style={{ ...style, transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TILT CARD
══════════════════════════════════════════════════════════════════ */

function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -16;
    const ry = ((x / rect.width) - 0.5) * 16;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt-card ${className ?? ''}`}
      style={{ ...style, transition: 'transform 0.2s ease' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════════════════════════════ */

const FAQ_ITEMS = [
  {
    q: 'Comment fonctionne la génération de parcours par IA ?',
    a: 'Fit & Travel connecte GPT-4o à une base de données de villes mondiales. Tu indiques la ville, le type d\'activité, la distance souhaitée et le niveau de difficulté. L\'IA génère un parcours passant par les points d\'intérêt locaux (monuments, parcs, musées) avec un score de sécurité et les meilleures heures de pratique.',
  },
  {
    q: 'Mes données sont-elles sécurisées et conformes au RGPD ?',
    a: 'Oui. Toutes les données sont chiffrées au repos (AES-256) et en transit (TLS 1.3). Nous sommes entièrement conformes au RGPD et tes données ne sont jamais utilisées pour entraîner des modèles IA. Tu peux exporter ou supprimer toutes tes données à tout moment.',
  },
  {
    q: 'Comment fonctionnent les recommandations de restaurants ?',
    a: 'Notre IA analyse ta localisation, tes objectifs fitness (prise de masse, endurance, perte de poids) et tes restrictions alimentaires pour recommander des plats locaux adaptés à tes macros. Chaque recommandation inclut les calories, protéines, glucides et lipides.',
  },
  {
    q: 'L\'app fonctionne-t-elle sans connexion internet ?',
    a: 'Les fonctionnalités de base (consultation de tes séances, parcours sauvegardés) fonctionnent hors ligne. La génération de parcours IA, le coach IA et les recommandations restaurants nécessitent une connexion internet.',
  },
  {
    q: 'Quelle est la différence entre Premium Coach et Pass Voyageur ?',
    a: 'Le Pass Voyageur inclut tout du Premium Coach, plus des parcours illimités (vs 30/mois), le Coach IA sans limite de messages, des rappels SMS pour tes entraînements, et un accès API pour intégrer Fit & Travel dans tes propres outils.',
  },
  {
    q: 'Y a-t-il un essai gratuit ?',
    a: 'Oui ! Tous les plans payants démarrent avec 14 jours d\'essai gratuit — sans carte bancaire. Tu as accès à toutes les fonctionnalités de ton niveau pendant l\'essai. Après, repasse au plan Free ou continue avec ton plan choisi.',
  },
];

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className={`accordion-item ${openIdx === i ? 'open' : ''}`}>
          <button
            className="accordion-trigger"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <span>{item.q}</span>
            <ChevronDown
              size={18}
              style={{
                color: '#64748b',
                flexShrink: 0,
                transition: 'transform 0.3s ease',
                transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
          {openIdx === i && (
            <div className="accordion-content" style={{ animation: 'fadeInUp 0.25s ease' }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════════ */

const STATS = [
  { target: 5000,  suffix: '+',    label: 'Sportifs voyageurs', color: '#8b5cf6' },
  { target: 120,   suffix: '+',    label: 'Villes couvertes',   color: '#06b6d4' },
  { target: 99,    suffix: '.9%',  label: 'Uptime garanti',     color: '#10b981' },
  { target: 4,     suffix: '.9★',  label: 'Note moyenne',       color: '#f59e0b' },
];

const PLANS = [
  {
    name: 'FREE', price: 0, featured: false, desc: 'Pour commencer à courir',
    features: ['3 parcours IA/mois', 'Coach IA 5 messages', '10 logs nutrition', 'Séances illimitées', 'Support communautaire'],
  },
  {
    name: 'PREMIUM COACH', price: 29, featured: true, desc: 'Pour les sportifs voyageurs',
    features: ['30 parcours IA/mois', '100 messages Coach IA', 'Nutrition illimitée', 'Analyse performance IA', 'Recommandations restaurants', 'Support prioritaire'],
  },
  {
    name: 'PASS VOYAGEUR', price: 99, featured: false, desc: 'Pour les nomades sportifs',
    features: ['Parcours illimités', 'Coach IA illimité', 'SMS rappels run', 'Coach personnel IA', 'API access', 'SLA 99.9%'],
  },
];

const TESTIMONIALS = [
  {
    name: 'Sophie Moreau', role: 'Traileuse', company: 'Lyon', avatar: 'SM', stars: 5,
    quote: 'J\'ai couru à Barcelone, Tokyo et Lisbonne avec des parcours générés par Fit & Travel. Chaque fois, le coach IA m\'a donné le meilleur itinéraire passant par les monuments. Incroyable !',
    logo: '🏃',
  },
  {
    name: 'Antoine Leclerc', role: 'Consultant nomade', company: 'Paris / Monde', avatar: 'AL', stars: 5,
    quote: 'Maintenir ma routine sportive en voyage était un défi. Avec Fit & Travel, je trouve toujours un parcours sécurisé et des restos locaux adaptés à mes macros. Révolutionnaire.',
    logo: '🌍',
  },
  {
    name: 'Camille Dubois', role: 'Ultra-marathonienne', company: 'Bordeaux', avatar: 'CD', stars: 5,
    quote: 'L\'analyse de performance semaine par semaine m\'a permis d\'améliorer mon allure de 12% en 2 mois. Le Coach IA me donne des conseils vraiment personnalisés. Je recommande à 100%.',
    logo: '🥇',
  },
];

const INTEGRATIONS = [
  { name: 'Paris', color: '#8b5cf6', bg: 'rgba(139,92,246,0.2)', icon: '🇫🇷' },
  { name: 'Tokyo', color: '#f43f5e', bg: 'rgba(244,63,94,0.2)', icon: '🇯🇵' },
  { name: 'Barcelona', color: '#f59e0b', bg: 'rgba(245,158,11,0.2)', icon: '🇪🇸' },
  { name: 'New York', color: '#06b6d4', bg: 'rgba(6,182,212,0.2)', icon: '🇺🇸' },
  { name: 'Lisbonne', color: '#10b981', bg: 'rgba(16,185,129,0.2)', icon: '🇵🇹' },
  { name: 'Bangkok', color: '#a78bfa', bg: 'rgba(167,139,250,0.2)', icon: '🇹🇭' },
  { name: 'Marrakech', color: '#fb923c', bg: 'rgba(251,146,60,0.2)', icon: '🇲🇦' },
  { name: 'Sydney', color: '#22d3ee', bg: 'rgba(34,211,238,0.2)', icon: '🇦🇺' },
  { name: 'Montréal', color: '#f8fafc', bg: 'rgba(248,250,252,0.08)', icon: '🇨🇦' },
  { name: 'Dubaï', color: '#fbbf24', bg: 'rgba(251,191,36,0.2)', icon: '🇦🇪' },
  { name: 'Rome', color: '#f472b6', bg: 'rgba(244,114,182,0.2)', icon: '🇮🇹' },
  { name: 'Berlin', color: '#818cf8', bg: 'rgba(129,140,248,0.2)', icon: '🇩🇪' },
];

const COMPARISON_FEATURES = [
  { label: 'Génération de parcours IA', sp: true, notion: false, jira: false, asana: false },
  { label: 'Points d\'intérêt locaux', sp: true, notion: false, jira: false, asana: false },
  { label: 'Score de sécurité parcours', sp: true, notion: false, jira: false, asana: false },
  { label: 'Coach IA fitness 24/7', sp: true, notion: false, jira: false, asana: false },
  { label: 'Recommandations nutrition', sp: true, notion: false, jira: false, asana: false },
  { label: 'Suivi performances hebdo', sp: true, notion: 'partial', jira: false, asana: false },
  { label: 'Multi-sport (6 types)', sp: true, notion: false, jira: false, asana: false },
  { label: 'SMS rappels entraînement', sp: true, notion: false, jira: false, asana: false },
  { label: 'Analyse IA tendances', sp: true, notion: false, jira: false, asana: false },
  { label: 'Tarif de départ', sp: '0€', notion: '0€', jira: '0€', asana: '0€' },
];

function CompCell({ val }: { val: boolean | string }) {
  if (val === true) return <span className="comparison-check">✓</span>;
  if (val === false) return <span className="comparison-x">✕</span>;
  if (val === 'partial') return <span className="comparison-partial">~</span>;
  return <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{val}</span>;
}

const TIMELINE_STEPS = [
  {
    num: '01', title: 'Crée ton profil sportif', color: '#8b5cf6',
    desc: 'Indique tes objectifs fitness, ton niveau et tes préférences sportives. Notre IA personnalise tout à partir de tes données.',
    detail: '~1 minute',
  },
  {
    num: '02', title: 'Génère ton parcours IA', color: '#06b6d4',
    desc: 'GPT-4o génère un parcours local passant par les monuments, avec score de sécurité, distance et meilleure heure de départ.',
    detail: '~2 secondes',
  },
  {
    num: '03', title: 'Cours et enregistre ta séance', color: '#10b981',
    desc: 'Enregistre ta séance avec distance, durée, calories et fréquence cardiaque. Ton historique se construit automatiquement.',
    detail: 'En courant',
  },
  {
    num: '04', title: 'Progresse semaine après semaine', color: '#f43f5e',
    desc: 'Suis tes graphiques de progression, reçois les recommandations nutrition du Coach IA et atteins tes objectifs hebdomadaires.',
    detail: 'En continu',
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  useScrollReveal();
  const scrollProgress = useScrollProgress();
  const [billingYearly, setBillingYearly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const heroWords = useTypewriter(
    ['Courez le monde.', 'Bougez partout.', 'partout dans le monde.', 'Sport & voyage, réunis.'],
    70,
    2200
  );

  return (
    <div style={{ background: '#050d08', minHeight: '100vh', color: '#f0fdf4' }}>

      {/* SCROLL PROGRESS BAR */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* ── NAVBAR PILL FLOTTANT ────────────────────────────────────────── */}
      <div style={{ position: 'fixed', top: '20px', left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <nav style={{
          pointerEvents: 'all',
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '10px 12px 10px 20px',
          background: 'rgba(5,13,8,0.82)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(34,197,94,0.18)',
          borderRadius: '999px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 0 12px rgba(34,197,94,0.4)', flexShrink: 0 }}>🏃</div>
            <span style={{ fontWeight: 900, fontSize: '15px', color: '#f0fdf4', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Fit <span style={{ background: 'linear-gradient(135deg,#4ade80,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>&</span> Travel
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: 'rgba(34,197,94,0.15)', flexShrink: 0 }} />

          {/* Live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.8)', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>5,200+ sportifs</span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '999px', cursor: 'pointer', transition: 'all 0.25s ease', color: '#f0fdf4' }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(34,197,94,0.2)'; b.style.borderColor = 'rgba(34,197,94,0.5)'; b.style.boxShadow = '0 0 16px rgba(34,197,94,0.2)'; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(34,197,94,0.1)'; b.style.borderColor = 'rgba(34,197,94,0.25)'; b.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ display: 'block', width: '18px', height: '1.5px', background: '#f0fdf4', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '12px', height: '1.5px', background: '#4ade80', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '18px', height: '1.5px', background: '#f0fdf4', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#86efac' }}>Menu</span>
          </button>
        </nav>
      </div>

      {/* ── FULL-PAGE MENU OVERLAY ──────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(5,13,8,0.97)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          display: 'flex', flexDirection: 'column',
          transition: 'opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)',
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'scale(1)' : 'scale(1.04)',
          pointerEvents: menuOpen ? 'all' : 'none',
        }}
      >
        {/* Background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="orb orb-purple" style={{ width: 600, height: 600, top: '-150px', right: '-100px', opacity: 0.25 }} />
          <div className="orb orb-cyan" style={{ width: 400, height: 400, bottom: 0, left: '-80px', opacity: 0.18 }} />
        </div>

        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid rgba(34,197,94,0.08)', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 0 16px rgba(34,197,94,0.4)' }}>🏃</div>
            <span style={{ fontWeight: 900, fontSize: '17px', color: '#f0fdf4' }}>Fit <span style={{ background: 'linear-gradient(135deg,#4ade80,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>&</span> Travel</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: '18px', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(249,115,22,0.12)'; b.style.borderColor = 'rgba(249,115,22,0.4)'; b.style.color = '#fb923c'; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(255,255,255,0.04)'; b.style.borderColor = 'rgba(255,255,255,0.1)'; b.style.color = '#94a3b8'; }}
          >✕</button>
        </div>

        {/* SPLIT LAYOUT */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 2 }}>

          {/* LEFT — Activity showcase */}
          <div style={{ width: '38%', padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', borderRight: '1px solid rgba(34,197,94,0.07)' }}>

            {/* Route preview card */}
            <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '20px', padding: '22px', animation: menuOpen ? 'fadeInUp 0.5s ease 0.1s both' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>🗺️ Parcours IA · Barcelone</span>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>EASY</span>
              </div>
              <div style={{ height: '90px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(5,25,10,0.9),rgba(10,30,15,0.9))', border: '1px solid rgba(34,197,94,0.12)', position: 'relative', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 60%,rgba(34,197,94,0.15) 0%,transparent 60%),radial-gradient(circle at 70% 30%,rgba(249,115,22,0.1) 0%,transparent 50%)' }} />
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 300 90">
                  <path d="M 30 65 Q 80 30 120 50 Q 160 70 200 35 Q 240 10 270 45" stroke="#22c55e" strokeWidth="2" fill="none" strokeDasharray="6 3" opacity="0.7" />
                  <circle cx="30" cy="65" r="4" fill="#4ade80" />
                  <circle cx="270" cy="45" r="4" fill="#f97316" />
                  <circle cx="120" cy="50" r="2.5" fill="rgba(255,255,255,0.4)" />
                  <circle cx="200" cy="35" r="2.5" fill="rgba(255,255,255,0.4)" />
                </svg>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#4b7a5a' }}>
                <span>📏 <b style={{ color: '#86efac' }}>6.2km</b></span>
                <span>⏱ <b style={{ color: '#86efac' }}>38min</b></span>
                <span>🛡️ <b style={{ color: '#86efac' }}>9/10</b></span>
              </div>
            </div>

            {/* Weekly stats */}
            <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.12)', borderRadius: '16px', padding: '18px 20px', animation: menuOpen ? 'fadeInUp 0.5s ease 0.18s both' : 'none' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fb923c', marginBottom: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>📊 Cette semaine</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {([['23.4km','Distance'],['2h14','Temps'],['1,840','kcal']] as [string,string][]).map(([v,l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#f0fdf4', letterSpacing: '-0.03em' }}>{v}</div>
                    <div style={{ fontSize: '10px', color: '#4b7a5a', marginTop: '2px' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', animation: menuOpen ? 'fadeInUp 0.5s ease 0.24s both' : 'none' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.8)', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#4b7a5a' }}><b style={{ color: '#86efac' }}>142</b> sportifs en mouvement · 38 villes</span>
            </div>
          </div>

          {/* RIGHT — Nav links */}
          <div style={{ flex: 1, padding: '32px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', overflowY: 'auto' }}>
            {([
              { emoji: '🗺️', label: 'Parcours',      href: '#features',     desc: 'Parcours IA dans 50+ villes',          color: '#22c55e' },
              { emoji: '🍽️', label: 'Nutrition',      href: '#features',     desc: 'Plats locaux & macros sur mesure',     color: '#f97316' },
              { emoji: '📊', label: 'Performance',    href: '#features',     desc: 'Suivi semaine par semaine',            color: '#06b6d4' },
              { emoji: '🤖', label: 'Coach IA',       href: '#features',     desc: 'Conseils personnalisés 24/7',          color: '#a78bfa' },
              { emoji: '💰', label: 'Tarifs',         href: '#pricing',      desc: 'FREE · Premium Coach · Pass Voyageur', color: '#f59e0b' },
              { emoji: '💬', label: 'Témoignages',    href: '#testimonials', desc: 'Ce que disent nos sportifs',           color: '#34d399' },
            ] as {emoji:string;label:string;href:string;desc:string;color:string}[]).map((item, i) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderRadius: '14px', textDecoration: 'none', border: '1px solid transparent', transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)', animation: menuOpen ? `fadeInUp 0.4s ease ${0.08 + i * 0.055}s both` : 'none', cursor: 'pointer' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${item.color}0d`; el.style.borderColor = `${item.color}30`; el.style.transform = 'translateX(6px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'transparent'; el.style.borderColor = 'transparent'; el.style.transform = 'translateX(0)'; }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}12`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#4b7a5a', marginTop: '2px' }}>{item.desc}</div>
                </div>
                <div style={{ color: item.color, fontSize: '18px', opacity: 0.5, flexShrink: 0 }}>→</div>
              </a>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderTop: '1px solid rgba(34,197,94,0.08)', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: '#4b7a5a' }}>🌍 Disponible dans <b style={{ color: '#86efac' }}>50+ villes</b> · Aucune CB requise</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="btn-glass" style={{ padding: '10px 22px', fontSize: '13px', borderRadius: '999px' }}>Se connecter</button>
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="btn-glow" style={{ padding: '10px 22px', fontSize: '13px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '6px' }}>🏃 Commencer gratuitement</button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
        {/* Canvas particles */}
        <ParticleCanvas />

        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-purple"  style={{ width: 700, height: 700, top: '-200px',   left: '-200px',  opacity: 0.5 }} />
          <div className="orb orb-cyan"    style={{ width: 600, height: 600, top: '10%',      right: '-150px', opacity: 0.35 }} />
          <div className="orb orb-fuchsia" style={{ width: 400, height: 400, bottom: '0',     left: '40%',     opacity: 0.25 }} />
          <div className="orb orb-indigo"  style={{ width: 500, height: 500, bottom: '-100px',right: '20%',    opacity: 0.2 }} />
          <div className="grid-pattern absolute inset-0" />
        </div>

        {/* Floating tags */}
        <div className="float-tag hidden lg:flex items-center gap-2" style={{ top: '22%', left: '6%', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', animation: 'floatTag1 4s ease-in-out infinite' }}>
          <Sparkles size={12} /> Parcours IA dans 50+ villes
        </div>
        <div className="float-tag hidden lg:flex items-center gap-2" style={{ top: '35%', right: '5%', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee', animation: 'floatTag2 5s ease-in-out infinite' }}>
          <Zap size={12} /> Coach IA 24/7
        </div>
        <div className="float-tag hidden lg:flex items-center gap-2" style={{ bottom: '30%', left: '8%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', animation: 'floatTag3 3.5s ease-in-out infinite' }}>
          <Shield size={12} /> Score sécurité parcours
        </div>
        <div className="float-tag hidden lg:flex items-center gap-2" style={{ bottom: '38%', right: '7%', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185', animation: 'floatTag1 4.5s ease-in-out 1s infinite' }}>
          <Activity size={12} /> 5,000+ sportifs voyageurs
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-medium"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
            <Sparkles size={13} /> Propulsé par GPT-4o · Parcours IA dans le monde entier <ArrowRight size={13} />
          </div>

          {/* Headline with typewriter */}
          <h1 className="font-black mb-6" style={{ fontSize: 'clamp(42px,7vw,90px)', lineHeight: 1.04, letterSpacing: '-0.04em' }}>
            Votre coach IA,<br />
            <span className="gradient-text">{heroWords}</span>
            <span className="typewriter-cursor" style={{ marginLeft: 4 }} />
          </h1>

          {/* Glitch subtitle */}
          <p
            className="glitch text-lg md:text-xl mb-4 max-w-2xl mx-auto font-semibold"
            data-text="La plateforme de coaching sportif et voyage propulsée par l'IA"
            style={{ color: '#94a3b8', letterSpacing: '-0.01em' }}
          >
            La plateforme de coaching sportif et voyage propulsée par l'IA
          </p>

          <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: '#475569', lineHeight: 1.7 }}>
            Fit & Travel combine <strong style={{ color: '#94a3b8' }}>l'intelligence GPT-4o</strong> avec{' '}
            <strong style={{ color: '#94a3b8' }}>des parcours locaux personnalisés</strong> pour maintenir ta routine sportive partout dans le monde.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <MagneticButton>
              <Link href="/login">
                <button className="btn-glow flex items-center gap-2 text-base px-10 py-4 glow-pulse-anim">
                  Commencer gratuitement <ArrowRight size={16} />
                </button>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <button className="btn-glass flex items-center gap-2 text-base px-8 py-4">
                <Play size={14} /> Voir la démo 2 min
              </button>
            </MagneticButton>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap mb-16">
            {[
              { icon: <Shield size={14} />, label: '120+ villes mondiales', color: '#8b5cf6' },
              { icon: <Lock size={14} />, label: 'RGPD Conforme', color: '#06b6d4' },
              { icon: <Activity size={14} />, label: '99.9% Uptime SLA', color: '#10b981' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: b.color }}>
                {b.icon}
                <span style={{ fontWeight: 600 }}>{b.label}</span>
              </div>
            ))}
          </div>

          {/* Dashboard mockup */}
          <TiltCard>
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="absolute inset-0 blur-3xl" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,92,246,0.3) 0%, rgba(6,182,212,0.12) 60%, transparent 80%)', transform: 'scale(1.2)' }} />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(8,8,25,0.92)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" /><div className="w-3 h-3 rounded-full bg-yellow-500/70" /><div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <div className="ml-4 h-5 rounded-full flex items-center px-3 text-xs text-slate-600" style={{ background: 'rgba(255,255,255,0.04)', minWidth: 200 }}>app.fittravel.app/dashboard</div>
                </div>
                <div className="flex h-72">
                  <div className="w-14 border-r border-white/5 flex flex-col items-center gap-3 py-4">
                    {[Layers, Kanban, Bot, BarChart3, Bell].map((Icon, i) => (
                      <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-violet-600/80 text-white' : 'text-slate-600'}`}><Icon size={14} /></div>
                    ))}
                  </div>
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Km cette semaine', val: '23km', color: 'rgba(139,92,246,0.9)', icon: Activity },
                        { label: 'Calories brûlées', val: '1840', color: 'rgba(6,182,212,0.9)', icon: CheckCircle2 },
                        { label: 'Objectif atteint', val: '92%', color: 'rgba(16,185,129,0.9)', icon: TrendingUp },
                      ].map((s, i) => (
                        <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <s.icon size={12} style={{ color: s.color }} className="mb-1" />
                          <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
                          <div className="text-xs text-slate-600">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {[
                        { title: 'Run Tokyo — 8.3km 🇯🇵', prog: 100, color: '#22c55e' },
                        { title: 'Objectif semaine 23km', prog: 78, color: '#8b5cf6' },
                        { title: 'Programme HIIT x3/sem', prog: 66, color: '#06b6d4' },
                        { title: 'Parcours Barcelone', prog: 20, color: '#f59e0b' },
                      ].map((t, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                          <span className="text-xs text-slate-400 flex-1 truncate">{t.title}</span>
                          <div className="w-16 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${t.prog}%`, background: t.color }} /></div>
                          <span className="text-xs font-semibold" style={{ color: t.color }}>{t.prog}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-44 border-l border-white/5 p-3 flex flex-col gap-2">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><Bot size={10} className="text-violet-400" /> Coach IA</div>
                    <div className="rounded-xl p-2 text-xs text-slate-400" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                      +12% distance vs semaine précédente 🏃
                    </div>
                    <div className="rounded-xl p-2 text-xs text-slate-500" style={{ background: 'rgba(255,255,255,0.02)' }}>Générer un parcours ?</div>
                    <div className="mt-auto">
                      <div className="w-full rounded-lg px-2 py-1.5 text-xs text-center font-semibold" style={{ background: 'rgba(139,92,246,0.3)', color: '#c4b5fd', cursor: 'pointer' }}>Ask AI</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', backdropFilter: 'blur(10px)', color: '#c4b5fd', animation: 'bounceGentle 3s ease-in-out infinite' }}>
                <Sparkles size={10} /> AI enabled
              </div>
              <div className="absolute -bottom-3 -left-4 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', backdropFilter: 'blur(10px)', color: '#22d3ee', animation: 'bounceGentle 3.5s ease-in-out 0.5s infinite' }}>
                <Activity size={10} /> Live sync
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────────────────── */}
      <section className="py-14 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-center text-xs mb-8 uppercase tracking-widest font-semibold" style={{ color: '#1e293b' }}>
          Rejoint par 5,000+ sportifs voyageurs dans le monde
        </p>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {['Paris 🇫🇷', 'Tokyo 🇯🇵', 'Barcelona 🇪🇸', 'New York 🇺🇸', 'Lisbonne 🇵🇹', 'Bangkok 🇹🇭', 'Marrakech 🇲🇦', 'Sydney 🇦🇺', 'Rome 🇮🇹', 'Dubaï 🇦🇪',
              'Paris 🇫🇷', 'Tokyo 🇯🇵', 'Barcelona 🇪🇸', 'New York 🇺🇸', 'Lisbonne 🇵🇹', 'Bangkok 🇹🇭', 'Marrakech 🇲🇦', 'Sydney 🇦🇺', 'Rome 🇮🇹', 'Dubaï 🇦🇪'].map((name, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap" style={{ color: '#1e293b', fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>
                <div className="w-5 h-5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO GRID FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        <div className="orb orb-purple absolute" style={{ width: 500, height: 500, top: '40%', left: '-200px', opacity: 0.1 }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}>
              <Layers size={13} /> Features
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.03em' }}>
              Courir partout,<br /><span className="gradient-text">manger local, performer.</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#64748b' }}>Chaque fonctionnalité est pensée pour le sportif voyageur moderne.</p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-auto reveal">

            {/* LARGE: AI Chat — col-span-2 */}
            <div
              className="bento-card lg:col-span-2 reveal reveal-delay-1"
              style={{ minHeight: 340, border: '1px solid rgba(139,92,246,0.2)', background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(6,182,212,0.03) 100%)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8b5cf6' }}>Coach IA</div>
                  <h3 className="text-xl font-black" style={{ color: '#f1f5f9' }}>Ton coach fitness & voyage 24/7</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <Bot size={18} style={{ color: '#a78bfa' }} />
                </div>
              </div>
              <BentoChatCard />
            </div>

            {/* Kanban preview */}
            <div
              className="bento-card reveal reveal-delay-2"
              style={{ minHeight: 340, border: '1px solid rgba(6,182,212,0.15)', background: 'linear-gradient(135deg, rgba(6,182,212,0.04) 0%, rgba(16,185,129,0.03) 100%)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#06b6d4' }}>Parcours IA</div>
              <h3 className="text-lg font-black mb-4" style={{ color: '#f1f5f9' }}>Parcours de sport dans n'importe quelle ville</h3>
              <div className="flex flex-col gap-2">
                {[
                  { city: 'Barcelone', type: '🏃 Run 6km', score: '9/10' },
                  { city: 'Tokyo', type: '🚴 Vélo 12km', score: '8/10' },
                  { city: 'Lisbonne', type: '🚶 Marche 4km', score: '10/10' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: '#f1f5f9' }}>{r.city}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>{r.type}</div>
                    </div>
                    <div className="text-xs font-bold" style={{ color: '#10b981' }}>🛡️ {r.score}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats mini card */}
            <div
              className="bento-card reveal reveal-delay-3"
              style={{ border: '1px solid rgba(16,185,129,0.15)', background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 100%)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>Suivi Performance</div>
              <h3 className="text-lg font-black mb-4" style={{ color: '#f1f5f9' }}>Graphiques semaine par semaine</h3>
              <div className="space-y-3">
                {[
                  { label: 'Km cette semaine', val: '23km', color: '#10b981' },
                  { label: 'Calories brûlées', val: '1 840', color: '#f43f5e' },
                  { label: 'Score progression', val: '4.9★', color: '#f59e0b' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#64748b' }}>{s.label}</span>
                    <span className="text-sm font-black" style={{ color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrations mini */}
            <div
              className="bento-card reveal reveal-delay-4"
              style={{ border: '1px solid rgba(245,158,11,0.15)', background: 'linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 100%)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#f59e0b' }}>Nutrition locale</div>
              <h3 className="text-lg font-black mb-4" style={{ color: '#f1f5f9' }}>Plats locaux adaptés à tes macros</h3>
              <div className="flex flex-wrap gap-2">
                {['🍱 Tokyo', '🥩 Buenos Aires', '🥗 Paris', '🍜 Bangkok', '🥘 Marrakech', '🍝 Rome'].map((name, i) => (
                  <div key={i} className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                    {name}
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div
              className="bento-card reveal reveal-delay-5"
              style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 100%)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#818cf8' }}>Sécurité garantie</div>
              <h3 className="text-lg font-black mb-3" style={{ color: '#f1f5f9' }}>Score de sécurité sur chaque parcours</h3>
              <div className="space-y-2">
                {['Score sécurité /10', 'Meilleure heure de départ', 'Éclairage public', 'Zones à éviter'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                    <CheckCircle2 size={12} style={{ color: '#6366f1' }} />{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE AI DEMO ────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="orb orb-cyan absolute" style={{ width: 500, height: 500, top: '0', right: '-150px', opacity: 0.1 }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              <Code2 size={13} /> Live AI Demo
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.03em' }}>
              L'IA génère ton parcours<br /><span className="gradient-text">en temps réel</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal reveal-delay-1">
              <TerminalDemo />
            </div>
            <div className="reveal reveal-delay-2 flex flex-col gap-8">
              <div>
                <h3 className="font-black text-2xl mb-3" style={{ letterSpacing: '-0.02em' }}>
                  Un parcours localisé en <span className="gradient-text-cyan">2 secondes</span>
                </h3>
                <p className="text-base leading-relaxed" style={{ color: '#64748b' }}>
                  Indique simplement ta ville, ton activité et ta distance. Notre IA — propulsée par GPT-4o — génère un parcours passant par les monuments, évalue la sécurité et recommande les meilleurs spots nutrition à proximité.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { icon: <Brain size={18} />, title: 'IA géolocalisée', desc: 'Connaît les monuments, parcs et zones sécurisées de chaque ville', color: '#8b5cf6' },
                  { icon: <Zap size={18} />, title: 'Génération instantanée', desc: 'Parcours complet avec waypoints prêt en moins de 2 secondes', color: '#06b6d4' },
                  { icon: <Shield size={18} />, title: 'Score de sécurité', desc: 'Évalue l\'éclairage, la fréquentation et les risques de chaque parcours', color: '#f43f5e' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18`, border: `1px solid ${item.color}30`, color: item.color }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm mb-1" style={{ color: '#f1f5f9' }}>{item.title}</div>
                      <div className="text-sm" style={{ color: '#64748b' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS HEX GRID ──────────────────────────────────────── */}
      <section id="integrations" className="py-32 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
              <Globe size={13} /> Integrations
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.03em' }}>
              Explore le monde entier,<br /><span className="gradient-text">sport inclus</span>
            </h2>
            <p className="text-lg max-w-lg mx-auto" style={{ color: '#64748b' }}>Parcours disponibles dans 120+ villes mondiales. Nouvelles destinations ajoutées chaque semaine.</p>
          </div>
          <div className="hex-grid max-w-3xl mx-auto reveal">
            {INTEGRATIONS.map((intg, i) => (
              <div key={i} className="hex-item" style={{ background: intg.bg, border: `2px solid ${intg.color}30`, color: '#f1f5f9', animationDelay: `${i * 0.1}s` }}>
                <span style={{ fontSize: 22 }}>{intg.icon}</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{intg.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — TIMELINE ────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              <GitBranch size={13} /> How it works
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.03em' }}>
              Prêt à courir en <span className="gradient-text">4 étapes</span>
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(16,185,129,0.3), rgba(244,63,94,0.2))', transform: 'translateX(-50%)' }} />
            <div className="flex flex-col gap-12">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={i} className={`reveal reveal-delay-${i + 1} relative flex items-start gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0 ml-0 md:ml-0" style={{ marginLeft: i % 2 !== 0 ? 'auto' : 0 }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm neon-border" style={{ background: `${step.color}18`, color: step.color, boxShadow: `0 0 20px ${step.color}30` }}>
                      {step.num}
                    </div>
                  </div>
                  {/* Content */}
                  <div className={`flex-1 pb-2 ${i % 2 !== 0 ? 'md:text-right' : ''}`}>
                    <div className="text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: step.color }}>{step.detail}</div>
                    <h3 className="font-black text-xl mb-2" style={{ letterSpacing: '-0.02em' }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed max-w-sm" style={{ color: '#64748b' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'rgba(139,92,246,0.03)', borderTop: '1px solid rgba(139,92,246,0.08)', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
        <div className="orb orb-purple absolute" style={{ width: 600, height: 200, top: '-80px', left: '50%', transform: 'translateX(-50%)', opacity: 0.08 }} />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
          {STATS.map((s, i) => (
            <div key={i} className={`text-center reveal reveal-delay-${i + 1}`}>
              <div className="stat-number font-black mb-2" style={{ color: s.color }}>
                <Counter target={s.target} suffix={s.suffix} />
              </div>
              <div className="text-sm" style={{ color: '#475569' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
              <TrendingUp size={13} /> Pourquoi Fit & Travel
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.03em' }}>
              La seule app qui <span className="gradient-text">combine sport + voyage</span>
            </h2>
            <p className="text-lg" style={{ color: '#64748b' }}>L'IA au service de ta performance, où que tu sois.</p>
          </div>
          <div className="rounded-2xl overflow-hidden border reveal" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Header */}
            <div className="grid grid-cols-5 text-sm font-bold" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="p-4 col-span-2" style={{ color: '#64748b' }}>Feature</div>
              {[
                { name: 'Fit & Travel', highlight: true },
                { name: 'Strava' },
                { name: 'Nike Run' },
                { name: 'Garmin' },
              ].map((h, i) => (
                <div key={i} className="p-4 text-center" style={{ color: h.highlight ? '#a78bfa' : '#475569', background: h.highlight ? 'rgba(139,92,246,0.06)' : 'transparent', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                  {h.name}
                  {h.highlight && <div className="text-xs font-normal mt-0.5" style={{ color: '#6d28d9' }}>← You</div>}
                </div>
              ))}
            </div>
            {/* Rows */}
            {COMPARISON_FEATURES.map((feat, i) => (
              <div key={i} className="grid grid-cols-5 text-sm" style={{ borderBottom: i < COMPARISON_FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="p-4 col-span-2" style={{ color: '#94a3b8' }}>{feat.label}</div>
                {[
                  { val: feat.sp, highlight: true },
                  { val: feat.notion },
                  { val: feat.jira },
                  { val: feat.asana },
                ].map((cell, ci) => (
                  <div key={ci} className="p-4 flex items-center justify-center" style={{ background: cell.highlight ? 'rgba(139,92,246,0.04)' : 'transparent', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                    <CompCell val={cell.val as boolean | string} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="orb orb-indigo absolute" style={{ width: 500, height: 500, top: '0', right: '-200px', opacity: 0.1 }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}>
              <CreditCard size={13} /> Pricing
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.03em' }}>
              Simple. <span className="gradient-text">Transparent.</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: '#64748b' }}>Start free. Upgrade when you need more.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setBillingYearly(false)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: !billingYearly ? 'rgba(139,92,246,0.3)' : 'transparent', color: !billingYearly ? '#c4b5fd' : '#64748b' }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingYearly(true)}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                style={{ background: billingYearly ? 'rgba(139,92,246,0.3)' : 'transparent', color: billingYearly ? '#c4b5fd' : '#64748b' }}
              >
                Yearly
                <span className="text-xs rounded-full px-2 py-0.5" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => {
              const displayPrice = plan.price === 0 ? 0 : billingYearly ? Math.round(plan.price * 0.8) : plan.price;
              return (
                <TiltCard key={i}>
                  <div className={`pricing-card ${plan.featured ? 'featured' : ''} reveal reveal-delay-${i + 1} h-full`}>
                    {plan.featured && (
                      <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-5" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', animation: 'neonFlicker 5s infinite' }}>
                        <Sparkles size={11} /> Most popular
                      </div>
                    )}
                    <div className="mb-2 text-sm font-bold uppercase tracking-widest" style={{ color: plan.featured ? '#a78bfa' : '#64748b' }}>{plan.name}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-black" style={{ fontSize: 48, letterSpacing: '-0.04em', color: plan.featured ? '#f1f5f9' : '#94a3b8' }}>
                        {displayPrice === 0 ? 'Free' : `$${displayPrice}`}
                      </span>
                      {displayPrice > 0 && <span style={{ color: '#475569' }}>/mo</span>}
                    </div>
                    <p className="text-sm mb-8" style={{ color: '#475569' }}>{plan.desc}</p>
                    <Link href="/login">
                      <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-8 ${plan.featured ? 'btn-glow' : 'btn-glass'}`}>
                        {plan.price === 0 ? 'Start for free' : plan.featured ? 'Start Pro trial' : 'Talk to sales'}
                      </button>
                    </Link>
                    <ul className="space-y-3">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm" style={{ color: '#94a3b8' }}>
                          <CheckCircle2 size={15} style={{ color: plan.featured ? '#8b5cf6' : '#22c55e', flexShrink: 0 }} />{feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="orb orb-purple absolute" style={{ width: 600, height: 600, bottom: '-200px', right: '-150px', opacity: 0.1 }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
              <Star size={13} fill="currentColor" /> Testimonials
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,56px)', letterSpacing: '-0.03em' }}>
              Les sportifs voyageurs <span className="gradient-text">adorent Fit & Travel</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <TiltCard key={i}>
                <div className={`feature-card reveal reveal-delay-${i + 1} h-full flex flex-col`} style={{ padding: '36px' }}>
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-base leading-relaxed flex-1 mb-6" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                      {t.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-xs" style={{ color: '#475569' }}>{t.role} @ {t.company}</div>
                    </div>
                    <div className="text-xl">{t.logo}</div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              <MessageSquare size={13} /> FAQ
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,56px)', letterSpacing: '-0.03em' }}>
              Got <span className="gradient-text">questions?</span>
            </h2>
            <p className="text-lg" style={{ color: '#64748b' }}>Tout ce que tu dois savoir sur Fit & Travel.</p>
          </div>
          <div className="reveal">
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="py-40 px-6 relative overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="absolute inset-0">
          <div className="orb orb-purple" style={{ width: 800, height: 800, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.18 }} />
          <div className="orb orb-cyan"   style={{ width: 500, height: 500, top: '50%', left: '15%', transform: 'translateY(-50%)', opacity: 0.08 }} />
          <div className="orb orb-fuchsia" style={{ width: 400, height: 400, top: '50%', right: '10%', transform: 'translateY(-50%)', opacity: 0.07 }} />
          <div className="grid-pattern absolute inset-0" />
          {/* Mini particle canvas */}
          <ParticleCanvas />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10 reveal">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-semibold" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' }}>
            <Sparkles size={13} /> Rejoins 5,000+ sportifs voyageurs
          </div>
          <h2
            className="font-black mb-6"
            style={{ fontSize: 'clamp(40px,7vw,80px)', lineHeight: 1.05, letterSpacing: '-0.04em' }}
          >
            Prêt à courir<br />
            <span className="gradient-text">partout dans le monde ?</span>
          </h2>
          <p className="text-xl mb-12" style={{ color: '#475569', lineHeight: 1.6 }}>
            Commence gratuitement. Sans carte bancaire.<br />
            Ton coach IA t'attend dans 120+ villes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton>
              <Link href="/login">
                <button className="btn-glow glow-pulse-anim flex items-center gap-2 text-lg px-12 py-5 rounded-2xl">
                  Commencer aujourd'hui <ArrowRight size={18} />
                </button>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <button className="btn-glass flex items-center gap-2 text-base px-8 py-5 rounded-2xl">
                <Play size={16} /> Planifier une démo
              </button>
            </MagneticButton>
          </div>
          <p className="mt-6 text-sm" style={{ color: '#1e293b' }}>14-day free trial · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="px-6 pt-20 pb-10 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center glow-purple" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-black text-lg text-white">Fit & <span className="gradient-text-purple">Travel</span></span>
              </div>
              <p className="text-sm mb-6 max-w-xs" style={{ color: '#475569', lineHeight: 1.7 }}>
                La plateforme de coaching sportif et voyage propulsée par l'IA. Parcours, nutrition et performance pour les sportifs nomades.
              </p>
              {/* Newsletter */}
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input flex-1 text-sm rounded-xl"
                  style={{ height: 40, fontSize: 13 }}
                />
                <button className="btn-glow text-sm px-4 rounded-xl" style={{ height: 40, padding: '0 16px', fontSize: 13 }}>
                  <Mail size={14} />
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: '#1e293b' }}>Join our newsletter. No spam, ever.</p>
            </div>

            {/* Product */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#475569' }}>Product</div>
              <ul className="flex flex-col gap-3">
                {['Features', 'Pricing', 'Changelog', 'Roadmap', 'API Docs', 'Status'].map(item => (
                  <li key={item}><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#334155' }}>{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#475569' }}>Company</div>
              <ul className="flex flex-col gap-3">
                {['About', 'Blog', 'Careers', 'Press', 'Partners', 'Contact'].map(item => (
                  <li key={item}><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#334155' }}>{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#475569' }}>Legal</div>
              <ul className="flex flex-col gap-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security', 'DPA'].map(item => (
                  <li key={item}><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#334155' }}>{item}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-sm" style={{ color: '#1e293b' }}>© 2026 Fit & Travel. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              {[
                { icon: <Github size={18} />, label: 'GitHub' },
                { icon: <Slack size={18} />, label: 'Slack' },
                { icon: <Figma size={18} />, label: 'Figma' },
              ].map((s, i) => (
                <a key={i} href="#" className="transition-colors hover:text-white" style={{ color: '#1e293b' }} aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#1e293b' }}>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
