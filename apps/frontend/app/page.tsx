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
  { type: 'prompt', text: '$ smartproject generate --project "Mobile App Launch"' },
  { type: 'output', text: 'Analyzing project scope...' },
  { type: 'output', text: 'Connecting to GPT-4o engine...' },
  { type: 'success', text: '✓ AI plan generated in 1.2s' },
  { type: 'highlight', text: '' },
  { type: 'highlight', text: '📋 PROJECT PLAN: Mobile App Launch' },
  { type: 'output', text: '─────────────────────────────────────' },
  { type: 'cmd', text: 'Sprint 1 (Weeks 1-2): Foundation' },
  { type: 'output', text: '  • Setup CI/CD pipeline' },
  { type: 'output', text: '  • Define system architecture' },
  { type: 'output', text: '  • Design tokens & component lib' },
  { type: 'cmd', text: 'Sprint 2 (Weeks 3-4): Core Features' },
  { type: 'output', text: '  • Auth flow (OAuth + biometrics)' },
  { type: 'output', text: '  • Onboarding screens (7 steps)' },
  { type: 'output', text: '  • Push notifications setup' },
  { type: 'cmd', text: 'Sprint 3 (Weeks 5-6): Launch Prep' },
  { type: 'output', text: '  • Performance audit & optimization' },
  { type: 'output', text: '  • App store submissions (iOS/Android)' },
  { type: 'success', text: '⚠ Risk detected: Sprint 2 may be tight' },
  { type: 'success', text: '→ Suggestion: Add 1 dev for auth tasks' },
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
        <span style={{ marginLeft: 12, fontSize: 12, color: '#475569' }}>smartproject-ai — terminal</span>
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
  { role: 'user', text: 'Generate a sprint plan for our API redesign project' },
  { role: 'ai', text: 'Analyzing codebase dependencies and team velocity...' },
  { role: 'ai', text: 'Sprint plan ready! 3 sprints, 18 tasks, estimated 6 weeks. Risk score: Low 🟢' },
  { role: 'user', text: 'What are the top 3 risks?' },
  { role: 'ai', text: 'Breaking changes in v2 endpoints, Auth migration complexity, and documentation lag. I\'ve created mitigation tasks automatically.' },
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
    q: 'How does the AI project planning work?',
    a: 'SmartProject AI connects to GPT-4o to analyze your project description, team size, and goals. It automatically generates a structured sprint plan with tasks, milestones, risk assessments, and resource allocation — typically in under 2 seconds.',
  },
  {
    q: 'Is my data secure and GDPR compliant?',
    a: 'Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II certified, fully GDPR compliant, and your data is never used to train AI models. You can export or delete everything at any time.',
  },
  {
    q: 'Can I migrate from Jira or Notion?',
    a: 'Yes. We provide one-click importers for Jira, Notion, Asana, Linear, and Trello. Your projects, tasks, comments, and attachments migrate in minutes with zero data loss.',
  },
  {
    q: 'What integrations are available?',
    a: 'SmartProject AI integrates with Slack, GitHub, GitLab, Figma, Notion, Stripe, Google Workspace, Microsoft Teams, Zapier, and 40+ other tools via our REST API and webhooks.',
  },
  {
    q: 'What is the difference between the Pro and Enterprise plans?',
    a: 'The Enterprise plan adds SSO/SAML for single sign-on, unlimited team members, custom data retention policies, a dedicated account manager, priority SLA (99.9% uptime), audit logs, and on-premise deployment options.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes! All paid plans start with a 14-day free trial — no credit card required. You get full access to all features at your selected tier. After the trial, downgrade to Free or continue with your chosen plan.',
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
  { target: 12000, suffix: '+',    label: 'Active teams',       color: '#8b5cf6' },
  { target: 85000, suffix: '+',    label: 'Projects managed',   color: '#06b6d4' },
  { target: 99,    suffix: '.9%',  label: 'Uptime guaranteed',  color: '#10b981' },
  { target: 4,     suffix: '.9★',  label: 'Average rating',     color: '#f59e0b' },
];

const PLANS = [
  {
    name: 'Free', price: 0, featured: false, desc: 'Perfect to get started',
    features: ['3 active projects', 'AI chat (5/day)', '5 team members', 'Basic analytics', 'Community support'],
  },
  {
    name: 'Pro', price: 29, featured: true, desc: 'For ambitious teams',
    features: ['Unlimited projects', 'Unlimited AI', '10 members', 'Full analytics', 'SMS/Email alerts', 'Priority support', 'Integrations'],
  },
  {
    name: 'Enterprise', price: 99, featured: false, desc: 'For large organizations',
    features: ['Everything in Pro', 'SSO + SAML', 'Unlimited members', 'SLA 99.9%', 'Audit logs', 'Dedicated manager', 'Custom SLA'],
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen', role: 'CTO', company: 'TechFlow', avatar: 'SC', stars: 5,
    quote: 'SmartProject AI cut our planning time by 70%. The AI detects risks before they become blockers. It\'s like having a senior PM available 24/7 inside our workspace.',
    logo: '⚡',
  },
  {
    name: 'Marc Dubois', role: 'Lead Engineer', company: 'Nexus Labs', avatar: 'MD', stars: 5,
    quote: 'The streaming AI chat is genuinely jaw-dropping. I generate a full sprint plan in 30 seconds. My team shipped our last product 3 weeks early because of this tool.',
    logo: '🔬',
  },
  {
    name: 'Julie Martin', role: 'Product Manager', company: 'Scale.ai', avatar: 'JM', stars: 5,
    quote: 'The Kanban + analytics combo gives us perfect visibility. The smart notifications mean we never miss a deadline. My entire team loves it — even the skeptics.',
    logo: '🚀',
  },
];

const INTEGRATIONS = [
  { name: 'Slack', color: '#4A154B', bg: 'rgba(74,21,75,0.3)', icon: '💬' },
  { name: 'GitHub', color: '#f8fafc', bg: 'rgba(248,250,252,0.08)', icon: '🐙' },
  { name: 'Jira', color: '#0052CC', bg: 'rgba(0,82,204,0.2)', icon: '🔷' },
  { name: 'Notion', color: '#f8fafc', bg: 'rgba(248,250,252,0.08)', icon: '📝' },
  { name: 'Figma', color: '#F24E1E', bg: 'rgba(242,78,30,0.2)', icon: '🎨' },
  { name: 'Stripe', color: '#635BFF', bg: 'rgba(99,91,255,0.2)', icon: '💳' },
  { name: 'Zapier', color: '#FF4A00', bg: 'rgba(255,74,0,0.2)', icon: '⚡' },
  { name: 'Linear', color: '#5E6AD2', bg: 'rgba(94,106,210,0.2)', icon: '📐' },
  { name: 'Vercel', color: '#f8fafc', bg: 'rgba(248,250,252,0.08)', icon: '▲' },
  { name: 'Asana', color: '#F06A6A', bg: 'rgba(240,106,106,0.2)', icon: '✅' },
  { name: 'Teams', color: '#6264A7', bg: 'rgba(98,100,167,0.2)', icon: '🏢' },
  { name: 'Datadog', color: '#774AA4', bg: 'rgba(119,74,164,0.2)', icon: '🐶' },
];

const COMPARISON_FEATURES = [
  { label: 'AI project generation', sp: true, notion: false, jira: false, asana: false },
  { label: 'Automated sprint planning', sp: true, notion: false, jira: 'partial', asana: 'partial' },
  { label: 'Risk detection & alerts', sp: true, notion: false, jira: false, asana: false },
  { label: 'Real-time AI chat', sp: true, notion: false, jira: false, asana: false },
  { label: 'Kanban + Gantt + List views', sp: true, notion: true, jira: true, asana: true },
  { label: 'Team analytics & burndown', sp: true, notion: 'partial', jira: true, asana: true },
  { label: 'SSO & SAML (Enterprise)', sp: true, notion: true, jira: true, asana: true },
  { label: 'One-click AI summaries', sp: true, notion: false, jira: false, asana: false },
  { label: 'Native integrations (40+)', sp: true, notion: true, jira: true, asana: true },
  { label: 'Pricing starts at', sp: '$0', notion: '$0', jira: '$0', asana: '$0' },
];

function CompCell({ val }: { val: boolean | string }) {
  if (val === true) return <span className="comparison-check">✓</span>;
  if (val === false) return <span className="comparison-x">✕</span>;
  if (val === 'partial') return <span className="comparison-partial">~</span>;
  return <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{val}</span>;
}

const TIMELINE_STEPS = [
  {
    num: '01', title: 'Describe your project', color: '#8b5cf6',
    desc: 'Type a brief description of your project — goals, team size, and deadline. Our AI understands natural language, no templates needed.',
    detail: '~30 seconds',
  },
  {
    num: '02', title: 'AI generates your plan', color: '#06b6d4',
    desc: 'GPT-4o breaks down your project into sprints, tasks, milestones, and risk flags. It estimates effort and assigns optimal priorities.',
    detail: '~2 seconds',
  },
  {
    num: '03', title: 'Invite your team', color: '#10b981',
    desc: 'Add teammates with role-based permissions. Everyone gets a personalized view with their tasks, deadlines, and AI nudges.',
    detail: '~1 minute',
  },
  {
    num: '04', title: 'Ship faster', color: '#f43f5e',
    desc: 'Track progress with real-time dashboards, automated standups, and proactive AI alerts when something is at risk.',
    detail: 'Ongoing',
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  useScrollReveal();
  const scrollProgress = useScrollProgress();
  const [billingYearly, setBillingYearly] = useState(false);

  const heroWords = useTypewriter(
    ['10x faster.', 'smarter.', 'without the chaos.', 'powered by AI.'],
    70,
    2200
  );

  return (
    <div style={{ background: '#030712', minHeight: '100vh', color: '#f8fafc' }}>

      {/* SCROLL PROGRESS BAR */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(3,7,18,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center glow-purple" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-black text-lg text-white">SmartProject <span className="gradient-text-purple">AI</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#64748b' }}>
            {['Features', 'Pricing', 'Integrations', 'Docs'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors duration-200">{item}</a>
            ))}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: 'pulseRing 1.5s ease-out infinite' }} />
              Live demo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="btn-glass text-sm px-4 py-2 rounded-xl">Sign in</button>
            </Link>
            <MagneticButton>
              <Link href="/login">
                <button className="btn-glow text-sm px-5 py-2 rounded-xl flex items-center gap-1.5">
                  Get started <ArrowRight size={14} />
                </button>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </nav>

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
          <Sparkles size={12} /> AI-powered planning
        </div>
        <div className="float-tag hidden lg:flex items-center gap-2" style={{ top: '35%', right: '5%', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee', animation: 'floatTag2 5s ease-in-out infinite' }}>
          <Zap size={12} /> 10x faster delivery
        </div>
        <div className="float-tag hidden lg:flex items-center gap-2" style={{ bottom: '30%', left: '8%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', animation: 'floatTag3 3.5s ease-in-out infinite' }}>
          <Shield size={12} /> SOC 2 certified
        </div>
        <div className="float-tag hidden lg:flex items-center gap-2" style={{ bottom: '38%', right: '7%', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185', animation: 'floatTag1 4.5s ease-in-out 1s infinite' }}>
          <Activity size={12} /> 12,000+ teams
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-medium"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
            <Sparkles size={13} /> Powered by GPT-4o · Automatic sprint generation <ArrowRight size={13} />
          </div>

          {/* Headline with typewriter */}
          <h1 className="font-black mb-6" style={{ fontSize: 'clamp(42px,7vw,90px)', lineHeight: 1.04, letterSpacing: '-0.04em' }}>
            Ship projects<br />
            <span className="gradient-text">{heroWords}</span>
            <span className="typewriter-cursor" style={{ marginLeft: 4 }} />
          </h1>

          {/* Glitch subtitle */}
          <p
            className="glitch text-lg md:text-xl mb-4 max-w-2xl mx-auto font-semibold"
            data-text="The AI-native project management platform"
            style={{ color: '#94a3b8', letterSpacing: '-0.01em' }}
          >
            The AI-native project management platform
          </p>

          <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: '#475569', lineHeight: 1.7 }}>
            SmartProject AI combines <strong style={{ color: '#94a3b8' }}>GPT-4o intelligence</strong> with{' '}
            <strong style={{ color: '#94a3b8' }}>real-time collaboration</strong> to plan, execute, and deliver faster than ever.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <MagneticButton>
              <Link href="/login">
                <button className="btn-glow flex items-center gap-2 text-base px-10 py-4 glow-pulse-anim">
                  Start free — no card needed <ArrowRight size={16} />
                </button>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <button className="btn-glass flex items-center gap-2 text-base px-8 py-4">
                <Play size={14} /> Watch 2-min demo
              </button>
            </MagneticButton>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 flex-wrap mb-16">
            {[
              { icon: <Shield size={14} />, label: 'SOC 2 Type II', color: '#8b5cf6' },
              { icon: <Lock size={14} />, label: 'GDPR Compliant', color: '#06b6d4' },
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
                  <div className="ml-4 h-5 rounded-full flex items-center px-3 text-xs text-slate-600" style={{ background: 'rgba(255,255,255,0.04)', minWidth: 200 }}>app.smartproject.ai/dashboard</div>
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
                        { label: 'Active projects', val: '12', color: 'rgba(139,92,246,0.9)', icon: Layers },
                        { label: "Today's tasks", val: '48', color: 'rgba(6,182,212,0.9)', icon: CheckCircle2 },
                        { label: 'On track', val: '87%', color: 'rgba(16,185,129,0.9)', icon: TrendingUp },
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
                        { title: 'UI Design System v2', prog: 78, color: '#8b5cf6' },
                        { title: 'API authentication', prog: 100, color: '#22c55e' },
                        { title: 'E2E Test Suite', prog: 45, color: '#06b6d4' },
                        { title: 'Staging deployment', prog: 20, color: '#f59e0b' },
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
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><Bot size={10} className="text-violet-400" /> AI Assistant</div>
                    <div className="rounded-xl p-2 text-xs text-slate-400" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                      Risk detected: 2 critical tasks behind schedule.
                    </div>
                    <div className="rounded-xl p-2 text-xs text-slate-500" style={{ background: 'rgba(255,255,255,0.02)' }}>Generate sprint plan?</div>
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
          Trusted by 12,000+ forward-thinking teams
        </p>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {['Stripe', 'Vercel', 'Linear', 'Notion', 'GitHub', 'Figma', 'Slack', 'Atlassian', 'Shopify', 'Intercom',
              'Stripe', 'Vercel', 'Linear', 'Notion', 'GitHub', 'Figma', 'Slack', 'Atlassian', 'Shopify', 'Intercom'].map((name, i) => (
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
              Not just another PM tool.<br /><span className="gradient-text">This is next-gen.</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#64748b' }}>Every feature is designed to remove friction and let AI do the heavy lifting.</p>
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
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8b5cf6' }}>AI Assistant</div>
                  <h3 className="text-xl font-black" style={{ color: '#f1f5f9' }}>Chat your way to done</h3>
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
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#06b6d4' }}>Kanban</div>
              <h3 className="text-lg font-black mb-4" style={{ color: '#f1f5f9' }}>Visual task board</h3>
              <div className="grid grid-cols-3 gap-2 flex-1">
                {[
                  { label: 'To Do', color: '#64748b', tasks: ['Auth design', 'DB schema', 'API specs'] },
                  { label: 'In Progress', color: '#06b6d4', tasks: ['UI components', 'Testing'] },
                  { label: 'Done', color: '#10b981', tasks: ['Setup CI/CD', 'Team onboard', 'Kickoff'] },
                ].map((col, ci) => (
                  <div key={ci}>
                    <div className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: col.color }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                      {col.label}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {col.tasks.map((task, ti) => (
                        <div key={ti} className="rounded-lg px-2 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${col.color}20`, color: '#94a3b8' }}>
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats mini card */}
            <div
              className="bento-card reveal reveal-delay-3"
              style={{ border: '1px solid rgba(16,185,129,0.15)', background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 100%)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>Analytics</div>
              <h3 className="text-lg font-black mb-4" style={{ color: '#f1f5f9' }}>Real-time insights</h3>
              <div className="space-y-3">
                {[
                  { label: 'Sprint velocity', val: '94%', color: '#10b981' },
                  { label: 'On-time delivery', val: '87%', color: '#06b6d4' },
                  { label: 'Team happiness', val: '4.9★', color: '#f59e0b' },
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
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#f59e0b' }}>Integrations</div>
              <h3 className="text-lg font-black mb-4" style={{ color: '#f1f5f9' }}>40+ connectors</h3>
              <div className="flex flex-wrap gap-2">
                {['Slack', 'GitHub', 'Figma', 'Jira', 'Notion', 'Stripe'].map((name, i) => (
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
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#818cf8' }}>Security</div>
              <h3 className="text-lg font-black mb-3" style={{ color: '#f1f5f9' }}>Enterprise-grade</h3>
              <div className="space-y-2">
                {['AES-256 encryption', 'SOC 2 Type II', 'GDPR compliant', 'SSO + SAML'].map((f, i) => (
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
              Watch AI build your plan<br /><span className="gradient-text">in real-time</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal reveal-delay-1">
              <TerminalDemo />
            </div>
            <div className="reveal reveal-delay-2 flex flex-col gap-8">
              <div>
                <h3 className="font-black text-2xl mb-3" style={{ letterSpacing: '-0.02em' }}>
                  From idea to sprint in <span className="gradient-text-cyan">2 seconds</span>
                </h3>
                <p className="text-base leading-relaxed" style={{ color: '#64748b' }}>
                  Just describe your project in plain English. Our AI engine — powered by GPT-4o — understands context, estimates effort, assigns priorities, and flags risks automatically.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { icon: <Brain size={18} />, title: 'Context-aware AI', desc: 'Understands your team, tech stack, and past project velocity', color: '#8b5cf6' },
                  { icon: <Zap size={18} />, title: 'Instant generation', desc: 'Full project structure ready in under 3 seconds', color: '#06b6d4' },
                  { icon: <Shield size={18} />, title: 'Risk intelligence', desc: 'Proactively detects bottlenecks before they derail your sprint', color: '#f43f5e' },
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
              Plug into your <span className="gradient-text">entire stack</span>
            </h2>
            <p className="text-lg max-w-lg mx-auto" style={{ color: '#64748b' }}>40+ native integrations. Your tools, connected — not replaced.</p>
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
              Go live in <span className="gradient-text">4 steps</span>
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
              <TrendingUp size={13} /> Why SmartProject AI
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px,5vw,60px)', letterSpacing: '-0.03em' }}>
              We just <span className="gradient-text">outperform</span> them all
            </h2>
            <p className="text-lg" style={{ color: '#64748b' }}>Especially on AI. That&apos;s our moat.</p>
          </div>
          <div className="rounded-2xl overflow-hidden border reveal" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Header */}
            <div className="grid grid-cols-5 text-sm font-bold" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="p-4 col-span-2" style={{ color: '#64748b' }}>Feature</div>
              {[
                { name: 'SmartProject AI', highlight: true },
                { name: 'Notion' },
                { name: 'Jira' },
                { name: 'Asana' },
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
              Teams that switched <span className="gradient-text">never looked back</span>
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
            <p className="text-lg" style={{ color: '#64748b' }}>Everything you need to know about SmartProject AI.</p>
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
            <Sparkles size={13} /> Join 12,000+ teams
          </div>
          <h2
            className="font-black mb-6"
            style={{ fontSize: 'clamp(40px,7vw,80px)', lineHeight: 1.05, letterSpacing: '-0.04em' }}
          >
            Ready to ship<br />
            <span className="gradient-text">at warp speed?</span>
          </h2>
          <p className="text-xl mb-12" style={{ color: '#475569', lineHeight: 1.6 }}>
            Start for free. No credit card. No lock-in.<br />
            Just your team, AI, and your next big win.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton>
              <Link href="/login">
                <button className="btn-glow glow-pulse-anim flex items-center gap-2 text-lg px-12 py-5 rounded-2xl">
                  Start free today <ArrowRight size={18} />
                </button>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <button className="btn-glass flex items-center gap-2 text-base px-8 py-5 rounded-2xl">
                <Play size={16} /> Schedule a demo
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
                <span className="font-black text-lg text-white">SmartProject <span className="gradient-text-purple">AI</span></span>
              </div>
              <p className="text-sm mb-6 max-w-xs" style={{ color: '#475569', lineHeight: 1.7 }}>
                The AI-native project management platform trusted by 12,000+ teams to plan, execute, and ship faster.
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
            <p className="text-sm" style={{ color: '#1e293b' }}>© 2026 SmartProject AI. All rights reserved.</p>
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
