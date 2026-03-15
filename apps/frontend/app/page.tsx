'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Shield, BarChart3, Brain, Users, ArrowRight,
  Star, Sparkles, TrendingUp,
  Bell, Play, CheckCircle2,
  Kanban, Bot, CreditCard, Activity, GitBranch, Layers
} from 'lucide-react';

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

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-0 blur-3xl" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.35) 0%, rgba(6,182,212,0.15) 50%, transparent 70%)', transform: 'scale(1.2)' }} />
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(10,10,30,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" /><div className="w-3 h-3 rounded-full bg-yellow-500/70" /><div className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="ml-4 h-5 rounded-full flex items-center px-2" style={{ background: 'rgba(255,255,255,0.04)', width: 200 }}>
            <span className="text-xs text-slate-600">app.smartproject.ai</span>
          </div>
        </div>
        <div className="flex h-64">
          <div className="w-14 border-r border-white/5 flex flex-col items-center gap-3 py-4">
            {[Layers, Kanban, Bot, BarChart3, Bell].map((Icon, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-primary-600/80 text-white' : 'text-slate-600'}`}><Icon size={14} /></div>
            ))}
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[{ label: 'Projets actifs', val: '12', color: 'rgba(139,92,246,0.8)', icon: Layers }, { label: 'Tâches du jour', val: '48', color: 'rgba(6,182,212,0.8)', icon: CheckCircle2 }, { label: 'Progression', val: '87%', color: 'rgba(34,197,94,0.8)', icon: TrendingUp }].map((s, i) => (
                <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <s.icon size={12} style={{ color: s.color }} className="mb-1" />
                  <div className="text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-xs text-slate-600">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[{ title: 'Design système UI v2', prog: 78, color: '#8b5cf6' }, { title: 'API authentication', prog: 100, color: '#22c55e' }, { title: 'Tests E2E Cypress', prog: 45, color: '#06b6d4' }, { title: 'Déploiement staging', prog: 20, color: '#f59e0b' }].map((t, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-xs text-slate-400 flex-1 truncate">{t.title}</span>
                  <div className="w-16 h-1 rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${t.prog}%`, background: t.color }} /></div>
                  <span className="text-xs" style={{ color: t.color }}>{t.prog}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-40 border-l border-white/5 p-3 flex flex-col gap-2">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><Bot size={10} className="text-primary-400" /> AI Assistant</div>
            <div className="rounded-xl p-2 text-xs text-slate-400" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>Risque détecté : 2 tâches critiques en retard.</div>
            <div className="rounded-xl p-2 text-xs text-slate-500" style={{ background: 'rgba(255,255,255,0.02)' }}>Générer un plan de sprint ?</div>
            <div className="mt-auto"><div className="w-full rounded-lg px-2 py-1 text-xs text-center font-medium" style={{ background: 'rgba(139,92,246,0.3)', color: '#c4b5fd' }}>Demander à l'IA</div></div>
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', backdropFilter: 'blur(10px)', color: '#c4b5fd', animation: 'bounceGentle 3s ease-in-out infinite' }}>
        <Sparkles size={10} /> IA activée
      </div>
      <div className="absolute -bottom-3 -left-4 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', backdropFilter: 'blur(10px)', color: '#22d3ee', animation: 'bounceGentle 3.5s ease-in-out 0.5s infinite' }}>
        <Activity size={10} /> Live
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Brain,     title: 'IA GPT-4o intégrée',  desc: 'Planification automatique, détection de risques et génération de tâches par intelligence artificielle.', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
  { icon: Kanban,    title: 'Kanban dynamique',      desc: 'Tableau visuel avec drag & drop, statuts personnalisés et vues filtrées en temps réel.', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
  { icon: BarChart3, title: 'Analytics avancés',     desc: 'Métriques détaillées, graphiques de progression et rapports exportables pour chaque projet.', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  { icon: Users,     title: 'Collaboration équipe',  desc: "Gestion de membres, rôles et permissions. Travaillez ensemble en temps réel.", color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  { icon: Bell,      title: 'Notifications smart',   desc: 'Alertes email, SMS et in-app. Ne manquez plus aucune deadline grâce aux rappels intelligents.', color: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
  { icon: Shield,    title: 'Sécurité enterprise',   desc: "RGPD, chiffrement AES-256, SSO OAuth2 et audit logs complets. Vos données protégées.", color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
];

const STEPS = [
  { num: '01', title: 'Créez votre projet', desc: "Décrivez votre projet en quelques mots. Notre IA génère automatiquement un plan structuré avec milestones et estimations." },
  { num: '02', title: "L'IA organise tout", desc: "GPT-4o décompose votre projet en tâches, identifie les risques et propose une roadmap optimisée pour votre équipe." },
  { num: '03', title: 'Livrez plus vite',   desc: "Suivez la progression en temps réel, recevez des alertes proactives et collaborez sans friction." },
];

const STATS = [
  { target: 12000, suffix: '+',    label: 'Utilisateurs actifs', color: '#8b5cf6' },
  { target: 85000, suffix: '+',    label: 'Projets gérés',       color: '#06b6d4' },
  { target: 99,    suffix: '.9%',  label: 'Uptime garanti',      color: '#10b981' },
  { target: 4,     suffix: '.9/5', label: 'Note moyenne',        color: '#f59e0b' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen',  role: 'CTO @ TechFlow',  avatar: 'SC', quote: "SmartProject a réduit notre temps de planification de 70%. L'IA détecte les risques avant qu'ils deviennent des problèmes.", stars: 5 },
  { name: 'Marc Dubois', role: 'Lead Dev @ Nexus', avatar: 'MD', quote: "Le chat IA en streaming est bluffant. Je génère un plan de sprint complet en 30 secondes. Incroyable gain de temps.", stars: 5 },
  { name: 'Julie Martin',role: 'PM @ Scale.ai',    avatar: 'JM', quote: "L'interface Kanban + analytics donne une visibilité parfaite. Mon équipe adore les notifications intelligentes.", stars: 5 },
];

const PLANS = [
  { name: 'Free',       price: '0€',  featured: false, desc: 'Parfait pour démarrer',          features: ['3 projets actifs', 'Chat IA basique (5/jour)', '5 membres max', 'Analytics basiques', 'Support communauté'] },
  { name: 'Pro',        price: '29€', featured: true,  desc: 'Pour les équipes ambitieuses',   features: ['Projets illimités', 'IA avancée illimitée', '10 membres', 'Analytics complets', 'Notifications SMS/Email', 'Support prioritaire'] },
  { name: 'Enterprise', price: '99€', featured: false, desc: 'Pour les grandes organisations', features: ['Tout Pro inclus', 'SSO + SAML', 'Membres illimités', 'SLA 99.9%', 'Audit logs', 'Account manager dédié'] },
];

export default function LandingPage() {
  useScrollReveal();

  return (
    <div style={{ background: '#030712', minHeight: '100vh', color: '#f8fafc' }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(3,7,18,0.75)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center glow-purple" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">SmartProject <span className="gradient-text-purple">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#94a3b8' }}>
            {['Fonctionnalités', 'Tarifs', 'Témoignages', 'Docs'].map(item => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><button className="btn-glass text-sm px-4 py-2 rounded-xl">Connexion</button></Link>
            <Link href="/login"><button className="btn-glow text-sm px-4 py-2 rounded-xl">Démarrer gratuitement</button></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="orb orb-purple"  style={{ width: 700, height: 700, top: '-200px',   left: '-200px',  opacity: 0.5 }} />
          <div className="orb orb-cyan"    style={{ width: 600, height: 600, top: '10%',      right: '-150px', opacity: 0.35 }} />
          <div className="orb orb-fuchsia" style={{ width: 400, height: 400, bottom: '0',     left: '40%',     opacity: 0.25 }} />
          <div className="orb orb-indigo"  style={{ width: 500, height: 500, bottom: '-100px',right: '20%',    opacity: 0.2 }} />
          <div className="grid-pattern absolute inset-0" />
        </div>
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-medium"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
            <Sparkles size={13} /> Propulsé par GPT-4o · Génération automatique de sprints <ArrowRight size={13} />
          </div>
          <h1 className="font-black mb-6" style={{ fontSize: 'clamp(42px, 7vw, 88px)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Gérez vos projets<br />
            <span className="gradient-text">avec l'intelligence</span><br />
            <span style={{ color: '#e2e8f0' }}>artificielle</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#64748b', lineHeight: 1.7 }}>
            La plateforme SaaS qui combine <strong style={{ color: '#94a3b8' }}>gestion de projets</strong> et{' '}
            <strong style={{ color: '#94a3b8' }}>IA GPT-4o</strong> pour planifier, organiser et livrer plus vite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/login">
              <button className="btn-glow flex items-center gap-2 text-base px-8 py-4">Démarrer gratuitement <ArrowRight size={16} /></button>
            </Link>
            <button className="btn-glass flex items-center gap-2 text-base px-8 py-4"><Play size={14} /> Voir la démo</button>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* LOGOS MARQUEE */}
      <section className="py-12 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-center text-sm mb-8" style={{ color: '#334155' }}>Ils nous font confiance</p>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {['Stripe', 'Vercel', 'Linear', 'Notion', 'GitHub', 'Figma', 'Slack', 'Atlassian', 'Stripe', 'Vercel', 'Linear', 'Notion', 'GitHub', 'Figma', 'Slack', 'Atlassian'].map((name, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap" style={{ color: '#1e293b', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
                <div className="w-5 h-5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />{name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="orb orb-purple absolute" style={{ width: 500, height: 500, top: '50%', left: '-200px', opacity: 0.12 }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}>
              <Layers size={13} /> Fonctionnalités
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.03em' }}>
              Tout ce dont votre équipe<br /><span className="gradient-text">a besoin</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#64748b' }}>Une suite complète d'outils pensés pour maximiser votre productivité.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card reveal reveal-delay-${i + 1}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: f.glow.replace('0.3', '0.12'), border: `1px solid ${f.glow}` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#f1f5f9' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
              <GitBranch size={13} /> Comment ça marche
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.03em' }}>
              Opérationnel en <span className="gradient-text">3 étapes</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.6), rgba(6,182,212,0.6))' }} />
            {STEPS.map((step, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1} text-center`}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 font-black text-2xl neon-border" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>{step.num}</div>
                <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'rgba(139,92,246,0.04)', borderTop: '1px solid rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="orb orb-purple absolute" style={{ width: 600, height: 300, top: '-100px', left: '50%', transform: 'translateX(-50%)', opacity: 0.1 }} />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {STATS.map((s, i) => (
            <div key={i} className={`text-center reveal reveal-delay-${i + 1}`}>
              <div className="stat-number font-black mb-2" style={{ color: s.color }}><Counter target={s.target} suffix={s.suffix} /></div>
              <div className="text-sm" style={{ color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="orb orb-cyan absolute" style={{ width: 500, height: 500, top: '0', right: '-200px', opacity: 0.1 }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 text-sm" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}>
              <CreditCard size={13} /> Tarifs
            </div>
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.03em' }}>Simple et <span className="gradient-text">transparent</span></h2>
            <p className="text-lg" style={{ color: '#64748b' }}>Commencez gratuitement. Évoluez selon vos besoins.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <div key={i} className={`pricing-card ${plan.featured ? 'featured' : ''} reveal reveal-delay-${i + 1}`}>
                {plan.featured && (
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-5" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}>
                    <Sparkles size={11} /> Le plus populaire
                  </div>
                )}
                <div className="mb-2 text-sm font-semibold" style={{ color: plan.featured ? '#a78bfa' : '#64748b' }}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-black" style={{ fontSize: 44, letterSpacing: '-0.03em' }}>{plan.price}</span>
                  <span style={{ color: '#475569' }}>/mois</span>
                </div>
                <p className="text-sm mb-8" style={{ color: '#64748b' }}>{plan.desc}</p>
                <Link href="/login">
                  <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-8 ${plan.featured ? 'btn-glow' : 'btn-glass'}`}>
                    {plan.price === '0€' ? 'Démarrer gratuitement' : plan.featured ? 'Commencer avec Pro' : 'Contacter le commercial'}
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
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="font-black mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.03em' }}>
              Ils adorent <span className="gradient-text">SmartProject AI</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`feature-card reveal reveal-delay-${i + 1}`}>
                <div className="flex gap-0.5 mb-4">{Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={14} fill="#f59e0b" className="text-yellow-500" />)}</div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#94a3b8' }}>"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs" style={{ color: '#475569' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="orb orb-purple" style={{ width: 700, height: 700, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.2 }} />
          <div className="orb orb-cyan"   style={{ width: 500, height: 500, top: '50%', left: '20%', transform: 'translateY(-50%)', opacity: 0.1 }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10 reveal">
          <h2 className="font-black mb-6" style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Prêt à passer à la<br /><span className="gradient-text">vitesse supérieure ?</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: '#64748b' }}>Rejoignez 12 000+ équipes qui livrent plus vite avec SmartProject AI.</p>
          <Link href="/login">
            <button className="btn-glow glow-pulse-anim flex items-center gap-2 text-base px-10 py-4 mx-auto">
              Démarrer gratuitement — 0€ <ArrowRight size={16} />
            </button>
          </Link>
          <p className="mt-5 text-xs" style={{ color: '#1e293b' }}>Aucune carte bancaire requise · Annulation à tout moment</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="font-bold">SmartProject AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm" style={{ color: '#334155' }}>
            {['Confidentialité', 'CGU', 'Contact', 'Status'].map(item => (
              <a key={item} href="#" className="hover:text-slate-400 transition-colors">{item}</a>
            ))}
          </div>
          <p className="text-sm" style={{ color: '#1e293b' }}>© 2026 SmartProject AI</p>
        </div>
      </footer>
    </div>
  );
}
