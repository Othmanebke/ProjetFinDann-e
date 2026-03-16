'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Map, Utensils, Bot, TrendingUp, ArrowRight, ChevronDown, Star, Shield, Globe, ChevronRight, BarChart2, MapPin, Navigation, CreditCard, MessageCircle, Lock, Leaf } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════════════ */

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
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
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
}

function useTypewriter(phrases: string[], speed = 65, pause = 2200) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = phrases[phraseIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplayed(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        } else {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        if (charIdx > 0) {
          setDisplayed(current.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        } else {
          setDeleting(false);
          setPhraseIdx(i => (i + 1) % phrases.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);
  return displayed;
}

function useCounter(target: number, duration = 2000, startOnVisible = true) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!startOnVisible) { setStarted(true); return; }
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnVisible]);
  useEffect(() => {
    if (!started) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return { val, ref };
}

/* ─── SCROLL PATH OVERLAY ─────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════
   LOGO SVG
══════════════════════════════════════════════════════════════════ */
function ElanLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
      {/* Running figure */}
      <circle cx="24" cy="10" r="3" fill="white" />
      {/* Body */}
      <path d="M24 13 L21 22 L17 28" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Left arm back */}
      <path d="M22 16 L26 14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      {/* Right arm forward */}
      <path d="M22 18 L18 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      {/* Right leg forward */}
      <path d="M21 22 L18 28 L15 31" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Speed lines */}
      <path d="M12 18 L16 18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 21 L15 21" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ ITEM
══════════════════════════════════════════════════════════════════ */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion-item${open ? ' open' : ''}`}>
      <button className="accordion-trigger" onClick={() => setOpen(o => !o)}>
        {q}
        <ChevronDown size={18} style={{ color: '#EA580C', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', flexShrink: 0 }} />
      </button>
      {open && <div className="accordion-content">{a}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useScrollReveal();
  const scrollProgress = useScrollProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [billingYearly, setBillingYearly] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [wideScreen, setWideScreen] = useState(false);
  useEffect(() => {
    const check = () => setWideScreen(window.innerWidth >= 1280);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Sticky steps scroll tracking
  useEffect(() => {
    const onScroll = () => {
      if (!carouselRef.current) return;
      const rect = carouselRef.current.getBoundingClientRect();
      const total = carouselRef.current.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.max(0, -rect.top);
      setActiveStep(Math.min(2, Math.floor((scrolled / total) * 3)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroWord = useTypewriter(['partout dans le monde.', 'en toute sécurité.', 'à votre rythme.', 'avec l\'IA à vos côtés.'], 60, 2400);
  const km = useCounter(2840000, 2200);
  const cities = useCounter(127, 1800);
  const users = useCounter(5200, 2000);

  const features = [
    { Icon: Map,       color: '#047857', bg: 'rgba(4,120,87,0.08)',   border: 'rgba(4,120,87,0.15)',   title: 'Parcours IA',       desc: 'Itinéraires générés en temps réel passant par les monuments, musées et parcs locaux. Score de sécurité, meilleure heure de départ.' },
    { Icon: Utensils,  color: '#EA580C', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.15)',  title: 'Nutrition Locale',  desc: 'Recommandations de plats locaux adaptés à vos macros et objectifs. La gastronomie au service de la performance.' },
    { Icon: BarChart2, color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.15)', title: 'Suivi Performance', desc: 'Tableau de bord semaine par semaine. Comparez vos distances, durées et calories pour mesurer votre progression.' },
    { Icon: Bot,       color: '#78350F', bg: 'rgba(120,53,15,0.08)',  border: 'rgba(120,53,15,0.15)',  title: 'Coach IA 24/7',     desc: 'Assistant conversationnel spécialisé sport & voyage. Conseils récupération, adaptation météo, programmes sur mesure.' },
    { Icon: Shield,    color: '#047857', bg: 'rgba(4,120,87,0.08)',   border: 'rgba(4,120,87,0.15)',   title: 'Sécurité Garantie', desc: 'Chaque parcours est analysé : éclairage, fréquentation, météo, qualité du sol. Courez l\'esprit tranquille.' },
    { Icon: Globe,     color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.15)', title: '127+ Villes',       desc: 'De Barcelone à Tokyo, de Lisbonne à New York. Notre base de données s\'enrichit chaque semaine.' },
  ] as { Icon: React.FC<{size?:number;color?:string}>, color:string, bg:string, border:string, title:string, desc:string }[];

  const plans = [
    {
      name: 'Liberté', price: 0, yearlyPrice: 0, featured: false, color: '#57534E',
      desc: 'Pour commencer l\'aventure',
      features: ['3 parcours IA / mois', '5 messages Coach IA', '10 logs nutrition', 'Suivi basique'],
      cta: 'Commencer gratuitement',
    },
    {
      name: 'Coach Premium', price: billingYearly ? 15 : 19, yearlyPrice: 15 * 12, featured: true, color: '#EA580C',
      desc: 'Pour le sportif voyageur engagé',
      features: ['30 parcours IA / mois', '100 messages Coach IA', 'Nutrition illimitée', 'Analyse performance IA', 'Alertes météo', 'Support prioritaire'],
      cta: 'Démarrer l\'essai gratuit',
    },
    {
      name: 'Pass Voyageur', price: billingYearly ? 29 : 39, yearlyPrice: 29 * 12, featured: false, color: '#047857',
      desc: 'Pour les explorateurs sans limites',
      features: ['Parcours illimités', 'Coach IA illimité', 'SMS rappels run', 'API accès', 'Accès multi-ville offline', 'Coach personnel dédié'],
      cta: 'Contacter l\'équipe',
    },
  ];

  const testimonials = [
    { name: 'Sophie M.', role: 'Consultante, 34 ans', city: '🇪🇸 Barcelone', avatar: 'SM', quote: 'J\'ai couru à Barcelone, Tokyo et Lisbonne. Chaque fois, Élan m\'a donné le meilleur parcours passant par les monuments. Absolument incroyable.', rating: 5 },
    { name: 'Thomas R.', role: 'Ingénieur, 29 ans', city: '🇯🇵 Tokyo', avatar: 'TR', quote: 'Maintenir ma routine sportive en voyage était un défi. Maintenant j\'ai mes repères partout dans le monde. L\'IA comprend vraiment mes objectifs.', rating: 5 },
    { name: 'Léa B.', role: 'Photographe, 27 ans', city: '🇵🇹 Lisbonne', avatar: 'LB', quote: 'Les recommandations de restaurants sont parfaites. Manger local et respecter mes macros semblait impossible — Élan l\'a rendu évident.', rating: 5 },
  ];

  const faqs = [
    { q: 'Comment Élan génère-t-il les parcours ?', a: 'Notre IA analyse la topographie, les points d\'intérêt, l\'éclairage, la fréquentation et la météo locale pour créer un itinéraire optimal adapté à votre niveau et vos objectifs.' },
    { q: 'Les parcours sont-ils vraiment sécurisés ?', a: 'Chaque parcours reçoit un score de sécurité de 1 à 10 basé sur l\'éclairage nocturne, la qualité des trottoirs, l\'affluence et les conditions météo. Nous recommandons aussi la meilleure heure de pratique.' },
    { q: 'Comment fonctionne le suivi nutritionnel ?', a: 'Dites à Élan dans quelle ville vous êtes et vos objectifs macros. Notre IA recommande des plats locaux authentiques avec les informations nutritionnelles détaillées.' },
    { q: 'Puis-je utiliser Élan hors connexion ?', a: 'Les plans Pass Voyageur permettent de télécharger vos parcours pour un usage hors ligne. Parfait pour les zones avec peu de réseau.' },
    { q: 'Quelle différence entre Coach Premium et Pass Voyageur ?', a: 'Coach Premium couvre 30 parcours/mois et 100 échanges avec le coach IA. Pass Voyageur est tout illimité, avec SMS reminders, accès API et un coach personnel dédié.' },
    { q: 'Y a-t-il une période d\'essai ?', a: 'Oui ! Coach Premium inclut 14 jours d\'essai gratuit, sans CB requise. Vous testez tout avant de vous engager.' },
  ];

  const comparisons = [
    { feature: 'Parcours IA géolocalisés', elan: true, strava: false, garmin: false },
    { feature: 'Points d\'intérêt sur parcours', elan: true, strava: false, garmin: false },
    { feature: 'Nutrition locale adaptée', elan: true, strava: false, garmin: false },
    { feature: 'Coach IA conversationnel', elan: true, strava: false, garmin: false },
    { feature: 'Score de sécurité parcours', elan: true, strava: false, garmin: false },
    { feature: 'Comparaison semaine/semaine', elan: true, strava: true, garmin: true },
    { feature: 'Multi-sport tracking', elan: true, strava: true, garmin: true },
    { feature: 'SMS rappels entraînement', elan: true, strava: false, garmin: false },
  ];

  const c = (ok: boolean | 'partial') => {
    if (ok === true) return <span className="comparison-check">✓</span>;
    if (ok === 'partial') return <span className="comparison-partial">~</span>;
    return <span className="comparison-x">✕</span>;
  };

  return (
    <div style={{ minHeight: '100vh', color: '#1C1917' }}>
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* ── NAVBAR PILL ─────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', top: '16px', left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <nav style={{
          pointerEvents: 'all',
          display: 'flex', alignItems: 'center', gap: '18px',
          padding: '8px 10px 8px 18px',
          background: 'rgba(250,248,237,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid #E5E1D0',
          borderRadius: '999px',
          boxShadow: '0 4px 24px rgba(28,25,23,0.1), 0 1px 4px rgba(28,25,23,0.06)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <ElanLogo size={32} />
            <span style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '16px', color: '#1C1917', letterSpacing: '-0.03em' }}>élan</span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '18px', background: '#E5E1D0' }} />

          {/* Live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C', boxShadow: '0 0 6px rgba(234,88,12,0.7)', display: 'inline-block', animation: 'pulseRing 2s ease-out infinite' }} />
            <span style={{ fontSize: '11px', color: '#EA580C', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', whiteSpace: 'nowrap' }}>5 200+ sportifs</span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#EA580C', border: 'none', borderRadius: '999px', cursor: 'pointer', transition: 'all 0.2s ease', color: 'white' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C2410C'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EA580C'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
              <span style={{ display: 'block', width: '16px', height: '1.5px', background: 'white', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '11px', height: '1.5px', background: 'rgba(255,255,255,0.7)', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '16px', height: '1.5px', background: 'white', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif' }}>Menu</span>
          </button>
        </nav>
      </div>

      {/* ── MENU OVERLAY ────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(250,248,237,0.98)',
        backdropFilter: 'blur(32px)',
        display: 'flex', flexDirection: 'column',
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        opacity: menuOpen ? 1 : 0,
        transform: menuOpen ? 'scale(1)' : 'scale(1.03)',
        pointerEvents: menuOpen ? 'all' : 'none',
      }}>
        {/* Topo pattern */}
        <div className="topo-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '1px solid #E5E1D0', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ElanLogo size={34} />
            <span style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '18px', color: '#1C1917' }}>élan</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white', border: '1px solid #E5E1D0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', color: '#57534E', transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(28,25,23,0.08)' }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#EA580C'; b.style.color = '#EA580C'; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#E5E1D0'; b.style.color = '#57534E'; }}
          >✕</button>
        </div>

        {/* SPLIT */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 2 }}>

          {/* LEFT — Showcase */}
          <div style={{ width: '38%', padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px', borderRight: '1px solid #E5E1D0' }}>

            {/* Route card */}
            <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '22px', boxShadow: '0 4px 16px rgba(28,25,23,0.06)', animation: menuOpen ? 'fadeInUp 0.5s ease 0.1s both' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', color: '#047857', letterSpacing: '0.06em', textTransform: 'uppercase' }}>🗺️ Parcours IA · Barcelone</span>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '999px', background: 'rgba(4,120,87,0.1)', border: '1px solid rgba(4,120,87,0.2)', color: '#047857', fontWeight: 700, fontFamily: '"Montserrat",sans-serif' }}>FACILE</span>
              </div>
              <div style={{ height: '90px', borderRadius: '12px', background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border: '1px solid rgba(4,120,87,0.15)', position: 'relative', overflow: 'hidden', marginBottom: '14px' }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 300 90">
                  <path d="M 30 65 Q 80 30 120 50 Q 160 70 200 35 Q 240 10 270 45" stroke="#047857" strokeWidth="2.5" fill="none" strokeDasharray="8 4" />
                  <circle cx="30" cy="65" r="5" fill="#047857" />
                  <circle cx="270" cy="45" r="5" fill="#EA580C" />
                  <circle cx="120" cy="50" r="3" fill="white" stroke="#047857" strokeWidth="1.5" />
                  <circle cx="200" cy="35" r="3" fill="white" stroke="#047857" strokeWidth="1.5" />
                  <text x="32" y="62" fontSize="7" fill="#057A55">🏖</text>
                  <text x="118" y="46" fontSize="7" fill="#057A55">⛪</text>
                  <text x="198" y="31" fontSize="7" fill="#057A55">🏛</text>
                </svg>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#A8A29E' }}>
                <span>📏 <b style={{ color: '#1C1917' }}>6.2 km</b></span>
                <span>⏱ <b style={{ color: '#1C1917' }}>38 min</b></span>
                <span>🛡️ <b style={{ color: '#047857' }}>9/10</b></span>
              </div>
            </div>

            {/* Weekly stats */}
            <div style={{ background: 'white', border: '1px solid rgba(234,88,12,0.15)', borderRadius: '16px', padding: '18px 20px', animation: menuOpen ? 'fadeInUp 0.5s ease 0.17s both' : 'none' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', color: '#EA580C', marginBottom: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}><BarChart2 size={11} color="#EA580C" /> Semaine en cours</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {([['23.4km','Distance'],['2h14','Temps'],['1 840','kcal']] as [string,string][]).map(([v,l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{v}</div>
                    <div style={{ fontSize: '10px', color: '#A8A29E', marginTop: '2px' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'white', border: '1px solid #E5E1D0', borderRadius: '12px', animation: menuOpen ? 'fadeInUp 0.5s ease 0.24s both' : 'none' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA580C', boxShadow: '0 0 6px rgba(234,88,12,0.6)', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#57534E' }}><b style={{ color: '#1C1917' }}>142</b> sportifs en mouvement · <b style={{ color: '#1C1917' }}>38</b> villes</span>
            </div>
          </div>

          {/* RIGHT — Links */}
          <div style={{ flex: 1, padding: '32px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
            {([
              { Icon: Map,           label: 'Parcours',    href: '#features',     desc: 'Itinéraires IA dans 127+ villes',         color: '#047857' },
              { Icon: Utensils,      label: 'Nutrition',   href: '#features',     desc: 'Plats locaux adaptés à vos macros',       color: '#EA580C' },
              { Icon: BarChart2,     label: 'Performance', href: '#features',     desc: 'Graphiques semaine par semaine',          color: '#0E7490' },
              { Icon: Bot,           label: 'Coach IA',    href: '#features',     desc: 'Conseils personnalisés 24h/24',           color: '#78350F' },
              { Icon: CreditCard,    label: 'Tarifs',      href: '#pricing',      desc: 'Liberté · Coach Premium · Pass Voyageur', color: '#EA580C' },
              { Icon: MessageCircle, label: 'Témoignages', href: '#testimonials', desc: 'Ce que disent nos 5 200 utilisateurs',    color: '#047857' },
            ] as {Icon: React.FC<{size?:number;color?:string}>;label:string;href:string;desc:string;color:string}[]).map((item, i) => {
              const NavIcon = item.Icon;
              return (
                <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', borderRadius: '14px', textDecoration: 'none', border: '1px solid transparent', transition: 'all 0.2s ease', animation: menuOpen ? `fadeInUp 0.4s ease ${0.08 + i * 0.05}s both` : 'none' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${item.color}0a`; el.style.borderColor = `${item.color}25`; el.style.transform = 'translateX(6px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'transparent'; el.style.borderColor = 'transparent'; el.style.transform = 'none'; }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}0f`, border: `1px solid ${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <NavIcon size={20} color={item.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 800, fontFamily: '"Montserrat",sans-serif', color: '#1C1917', letterSpacing: '-0.02em' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: '#A8A29E', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                  <ChevronRight size={16} style={{ color: item.color, opacity: 0.5, flexShrink: 0 }} />
                </a>
              );
            })}
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderTop: '1px solid #E5E1D0', position: 'relative', zIndex: 2, flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#A8A29E', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={13} color="#A8A29E" /> 127 villes · Aucune CB pour l'essai
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="btn-secondary" style={{ padding: '9px 20px', fontSize: '13px', borderRadius: '999px' }}>Se connecter</button>
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Commencer gratuitement <ArrowRight size={13} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="topo-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>

        {/* Warm orbs */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(234,88,12,0.12),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(4,120,87,0.1),transparent 70%)', pointerEvents: 'none' }} />

        {/* LEFT floating card — Live activity */}
        {wideScreen && (
          <div style={{ position: 'absolute', left: '28px', top: '50%', animation: 'floatY 5s ease-in-out infinite', zIndex: 2, pointerEvents: 'none' }}>
            <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '20px', boxShadow: '0 12px 40px rgba(28,25,23,0.12)', width: '190px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EA580C', boxShadow: '0 0 6px rgba(234,88,12,0.7)', display: 'inline-block', animation: 'pulseRing 2s ease-out infinite', flexShrink: 0 }} />
                <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', color: '#EA580C', letterSpacing: '0.06em' }}>EN COURS</span>
              </div>
              <div style={{ fontSize: '11px', color: '#A8A29E', marginBottom: '4px' }}>Sophie M. · 🇯🇵 Tokyo</div>
              <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: '"Montserrat",sans-serif', color: '#1C1917', letterSpacing: '-0.03em' }}>4.2 km</div>
              <svg width="100%" height="28" viewBox="0 0 160 28" style={{ display: 'block', margin: '10px 0 8px' }}>
                <polyline points="0,24 30,16 60,18 90,8 120,10 160,3" stroke="#EA580C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#57534E' }}>
                <span>⏱ 24:10</span>
                <span>❤️ 148 bpm</span>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F5F3E7' }}>
                <div style={{ fontSize: '10px', color: '#A8A29E', marginBottom: '6px', fontWeight: 600 }}>PROGRESSION</div>
                <div style={{ height: '5px', borderRadius: '999px', background: '#F5F3E7', overflow: 'hidden' }}>
                  <div style={{ width: '68%', height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,#EA580C,#D97706)', transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#57534E', marginTop: '4px' }}>68% de l'objectif journalier</div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT floating card — AI route preview */}
        {wideScreen && (
          <div style={{ position: 'absolute', right: '28px', top: '46%', animation: 'floatY2 5.8s ease-in-out infinite 0.6s', zIndex: 2, pointerEvents: 'none' }}>
            <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '20px', boxShadow: '0 12px 40px rgba(28,25,23,0.12)', width: '202px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', color: '#047857', marginBottom: '12px', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#047857', display: 'inline-block' }} />
                PARCOURS GÉNÉRÉ · IA
              </div>
              <div style={{ height: '74px', borderRadius: '12px', background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border: '1px solid rgba(4,120,87,0.15)', overflow: 'hidden', marginBottom: '12px', position: 'relative' }}>
                <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 180 74">
                  <path d="M 15,56 Q 55,22 90,38 Q 130,55 165,22" stroke="#047857" strokeWidth="2.5" fill="none" strokeDasharray="6 3" strokeLinecap="round" />
                  <circle cx="15" cy="56" r="4.5" fill="#047857" />
                  <circle cx="165" cy="22" r="4.5" fill="#EA580C" />
                  <circle cx="90" cy="38" r="3" fill="white" stroke="#047857" strokeWidth="1.5" />
                  <text x="17" y="52" fontSize="9" fill="#047857">🏖</text>
                  <text x="88" y="34" fontSize="9" fill="#047857">⛪</text>
                </svg>
                <div style={{ position: 'absolute', top: '6px', right: '8px', fontSize: '9px', fontWeight: 700, background: 'rgba(4,120,87,0.12)', border: '1px solid rgba(4,120,87,0.2)', color: '#047857', padding: '2px 7px', borderRadius: '999px', fontFamily: '"Montserrat",sans-serif' }}>🛡️ 9/10</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', color: '#1C1917', marginBottom: '6px' }}>Marais → Bastille</div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#57534E', marginBottom: '10px' }}>
                <span>📏 7.1 km</span>
                <span>⏱ 42 min</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['⛪ Cathédrale', '🌳 Jardin'].map(p => (
                  <span key={p} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '999px', background: 'rgba(4,120,87,0.08)', border: '1px solid rgba(4,120,87,0.15)', color: '#047857', fontWeight: 600, fontFamily: '"Montserrat",sans-serif' }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Badge */}
        <div className="reveal" style={{ marginBottom: '28px' }}>
          <span className="badge badge-orange" style={{ fontSize: '12px', padding: '6px 16px', gap: '8px', display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C', animation: 'pulseRing 2s ease-out infinite', display: 'inline-block' }} />
            Propulsé par GPT-4o · Parcours IA dans le monde entier
          </span>
        </div>

        {/* Headline */}
        <h1 className="reveal" style={{ fontSize: 'clamp(36px,7vw,80px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, textAlign: 'center', maxWidth: '900px', marginBottom: '12px', color: '#1C1917' }}>
          Courez le monde,<br />
          <span style={{ background: 'linear-gradient(135deg,#EA580C,#D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {heroWord || '\u00A0'}
          </span>
          <span style={{ display: 'inline-block', width: '2px', height: '0.85em', background: '#EA580C', marginLeft: '4px', verticalAlign: 'text-bottom', borderRadius: '2px', animation: 'blink 1s step-end infinite' }} />
        </h1>

        <p className="reveal reveal-delay-1" style={{ fontSize: 'clamp(16px,2vw,20px)', color: '#57534E', maxWidth: '600px', textAlign: 'center', lineHeight: 1.7, marginBottom: '40px' }}>
          Élan génère vos parcours de sport sécurisés dans n'importe quelle ville, recommande des plats locaux adaptés à vos objectifs, et suit vos progrès semaine après semaine.
        </p>

        {/* CTAs */}
        <div className="reveal reveal-delay-2" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
          <Link href="/login">
            <button className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '14px' }}>
              Démarrer gratuitement <ArrowRight size={16} />
            </button>
          </Link>
          <button className="btn-secondary" style={{ fontSize: '16px', padding: '14px 28px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ▶ Voir la démo
          </button>
        </div>

        {/* Trust badges */}
        <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
          {([
            { icon: Lock,  label: 'SOC2 Certifié' },
            { icon: Leaf,  label: 'GDPR Conforme' },
            { icon: Star,  label: '4.9/5 — 800+ avis' },
          ] as { icon: React.FC<{size?:number;color?:string}>, label: string }[]).map(({ icon: TrustIcon, label }) => (
            <span key={label} style={{ fontSize: '13px', color: '#57534E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrustIcon size={13} color="#EA580C" /> {label}
            </span>
          ))}
        </div>

        {/* Hero visual — fake dashboard */}
        <div className="reveal-scale" style={{ width: '100%', maxWidth: '900px', background: 'white', border: '1px solid #E5E1D0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 80px rgba(28,25,23,0.12), 0 4px 16px rgba(28,25,23,0.06)' }}>
          {/* Fake browser bar */}
          <div style={{ background: '#F5F3E7', borderBottom: '1px solid #E5E1D0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EA580C', opacity: 0.7 }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#D97706', opacity: 0.7 }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#047857', opacity: 0.7 }} />
            <div style={{ flex: 1, background: 'white', border: '1px solid #E5E1D0', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: '#A8A29E', marginLeft: '8px' }}>app.elan.run/dashboard</div>
          </div>
          {/* Dashboard preview */}
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px' }}>
            {[['23.4 km', 'Distance S52', '#EA580C'],['2h14', 'Temps actif', '#047857'],['1 840', 'Kcal brûlées', '#0E7490'],['4/4', 'Objectif séances', '#78350F']].map(([v,l,c]) => (
              <div key={l} style={{ background: '#FAF8ED', border: '1px solid #E5E1D0', borderRadius: '14px', padding: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: '"Montserrat",sans-serif', color: c as string }}>{v}</div>
                <div style={{ fontSize: '11px', color: '#A8A29E', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Fake chart area */}
          <div style={{ margin: '0 24px 24px', background: '#FAF8ED', border: '1px solid #E5E1D0', borderRadius: '14px', padding: '20px', height: '100px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '11px', color: '#A8A29E', marginBottom: '10px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif' }}>DISTANCE / SEMAINE</div>
            <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none">
              <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EA580C" stopOpacity="0.2"/><stop offset="100%" stopColor="#EA580C" stopOpacity="0"/></linearGradient></defs>
              <path d="M0 50 L50 40 L100 35 L150 45 L200 28 L250 32 L300 20 L350 15 L400 18 L400 60 L0 60Z" fill="url(#chartGrad)" />
              <path d="M0 50 L50 40 L100 35 L150 45 L200 28 L250 32 L300 20 L350 15 L400 18" stroke="#EA580C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <div style={{ background: '#1C1917', padding: '16px 0', overflow: 'hidden' }}>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {Array(2).fill(['Course à pied', 'Vélo urbain', 'Marche nordique', '127 villes', 'Parcours IA', 'Nutrition locale', 'Suivi performance', 'Coach IA', '4.9 / 5', 'Sécurité garantie']).flat().map((t, i) => (
              <span key={i} style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', color: i % 2 === 0 ? '#EA580C' : '#F5F3E7', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: i % 2 === 0 ? '#EA580C' : 'rgba(245,243,231,0.4)', display: 'inline-block', flexShrink: 0 }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS BAND ────────────────────────────────────────────────────── */}
      <section style={{ background: '#F5F3E7', borderTop: '1px solid #E5E1D0', borderBottom: '1px solid #E5E1D0', padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '32px', textAlign: 'center' }}>
          <div ref={km.ref}>
            <div style={{ fontSize: 'clamp(32px,5vw,52px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#EA580C', letterSpacing: '-0.04em' }}>{km.val.toLocaleString()}</div>
            <div style={{ fontSize: '14px', color: '#57534E', marginTop: '6px', fontWeight: 600 }}>km parcourus dans le monde</div>
          </div>
          <div ref={cities.ref}>
            <div style={{ fontSize: 'clamp(32px,5vw,52px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#047857', letterSpacing: '-0.04em' }}>{cities.val}+</div>
            <div style={{ fontSize: '14px', color: '#57534E', marginTop: '6px', fontWeight: 600 }}>villes dans la base IA</div>
          </div>
          <div ref={users.ref}>
            <div style={{ fontSize: 'clamp(32px,5vw,52px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#0E7490', letterSpacing: '-0.04em' }}>{users.val.toLocaleString()}+</div>
            <div style={{ fontSize: '14px', color: '#57534E', marginTop: '6px', fontWeight: 600 }}>sportifs voyageurs actifs</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span className="badge badge-green" style={{ marginBottom: '16px', display: 'inline-flex' }}>✦ Fonctionnalités</span>
          <h2 style={{ fontSize: 'clamp(28px,5vw,52px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Tout ce dont vous avez besoin,<br />
            <span style={{ background: 'linear-gradient(135deg,#EA580C,#D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>où que vous soyez</span>
          </h2>
          <p style={{ fontSize: '17px', color: '#57534E', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            De la génération de parcours à la recommandation nutritionnelle, Élan vous accompagne à chaque étape de votre aventure sportive.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>
          {features.map((f, i) => {
            const FIcon = f.Icon;
            return (
              <div key={f.title} className={`feature-card reveal reveal-delay-${(i % 3) + 1}`}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: f.bg, border: `1px solid ${f.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <FIcon size={22} color={f.color} />
                </div>
                <h3 style={{ fontFamily: '"Montserrat",sans-serif', fontSize: '17px', fontWeight: 800, color: '#1C1917', margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#57534E', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS — STICKY SCROLL ─────────────────────────────────── */}
      <section id="how" style={{ position: 'relative' }}>
        {/* Tall wrapper — 3 scroll "pages" */}
        <div ref={carouselRef} style={{ height: '310vh', background: '#F5F3E7', borderTop: '1px solid #E5E1D0', borderBottom: '1px solid #E5E1D0', position: 'relative' }}>
          {/* Sticky inner viewport */}
          <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>

            {/* Section title */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span className="badge badge-orange" style={{ marginBottom: '12px', display: 'inline-flex' }}>✦ Comment ça marche</span>
              <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#1C1917', margin: '0 0 20px', letterSpacing: '-0.03em' }}>3 étapes vers l'aventure</h2>
              {/* Progress pills */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: '4px', width: activeStep === i ? '36px' : '12px', borderRadius: '2px', background: activeStep === i ? '#EA580C' : '#D6CDB8', transition: 'all 0.4s ease' }} />
                ))}
              </div>
            </div>

            {/* Cards stack */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '700px', height: '330px' }}>

              {/* Step 01 */}
              <div style={{ position: 'absolute', inset: 0, opacity: activeStep === 0 ? 1 : 0, transform: activeStep === 0 ? 'translateY(0) scale(1)' : activeStep > 0 ? 'translateY(-48px) scale(0.97)' : 'translateY(48px) scale(0.97)', transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)', pointerEvents: activeStep === 0 ? 'all' : 'none' }}>
                <div style={{ background: 'white', border: '1px solid rgba(234,88,12,0.2)', borderRadius: '28px', padding: '36px', boxShadow: '0 8px 40px rgba(234,88,12,0.08)', height: '100%', display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={26} color="#EA580C" />
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: '"Montserrat",sans-serif', color: '#EA580C', letterSpacing: '0.1em' }}>ÉTAPE 01</div>
                        <h3 style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: '20px', color: '#1C1917', margin: '3px 0 0' }}>Dites-nous où vous êtes</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: '15px', color: '#57534E', lineHeight: 1.7, margin: 0 }}>Entrez votre ville actuelle ou laissez Élan vous géolocaliser. Précisez votre type d'activité préférée et votre niveau.</p>
                  </div>
                  <div style={{ width: '220px', flexShrink: 0, background: '#FAF8ED', border: '1px solid #E5E1D0', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: '#A8A29E', marginBottom: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={11} color="#A8A29E" /> Localisation détectée</div>
                    <div style={{ fontSize: '17px', fontWeight: 800, fontFamily: '"Montserrat",sans-serif', color: '#1C1917', marginBottom: '14px' }}>Tokyo, Japon</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {[['Course à pied', true], ['Vélo urbain', false], ['Marche', false]].map(([t, active]) => (
                        <div key={t as string} style={{ fontSize: '12px', padding: '7px 12px', borderRadius: '10px', background: active ? '#EA580C' : 'white', color: active ? 'white' : '#57534E', fontWeight: 600, border: `1px solid ${active ? '#EA580C' : '#E5E1D0'}`, fontFamily: '"Montserrat",sans-serif' }}>{t as string}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 02 */}
              <div style={{ position: 'absolute', inset: 0, opacity: activeStep === 1 ? 1 : 0, transform: activeStep === 1 ? 'translateY(0) scale(1)' : activeStep > 1 ? 'translateY(-48px) scale(0.97)' : 'translateY(48px) scale(0.97)', transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)', pointerEvents: activeStep === 1 ? 'all' : 'none' }}>
                <div style={{ background: 'white', border: '1px solid rgba(4,120,87,0.2)', borderRadius: '28px', padding: '36px', boxShadow: '0 8px 40px rgba(4,120,87,0.08)', height: '100%', display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(4,120,87,0.06)', border: '1px solid rgba(4,120,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Navigation size={26} color="#047857" />
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: '"Montserrat",sans-serif', color: '#047857', letterSpacing: '0.1em' }}>ÉTAPE 02</div>
                        <h3 style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: '20px', color: '#1C1917', margin: '3px 0 0' }}>L'IA génère votre parcours</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: '15px', color: '#57534E', lineHeight: 1.7, margin: 0 }}>En quelques secondes, votre itinéraire passe par les monuments locaux, avec un score de sécurité et les meilleures heures.</p>
                  </div>
                  <div style={{ width: '220px', flexShrink: 0, borderRadius: '18px', overflow: 'hidden', background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border: '1px solid rgba(4,120,87,0.15)', position: 'relative', height: '160px' }}>
                    <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 220 160">
                      <path d="M 20,120 Q 80,50 110,80 Q 150,110 200,55" stroke="#047857" strokeWidth="3" fill="none" strokeDasharray="8 4" strokeLinecap="round" />
                      <circle cx="20" cy="120" r="7" fill="#047857" />
                      <circle cx="200" cy="55" r="7" fill="#EA580C" />
                      <circle cx="110" cy="80" r="4.5" fill="white" stroke="#047857" strokeWidth="2" />
                    </svg>
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '10px', fontWeight: 700, background: 'rgba(4,120,87,0.12)', border: '1px solid rgba(4,120,87,0.2)', color: '#047857', padding: '4px 10px', borderRadius: '999px', fontFamily: '"Montserrat",sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={10} color="#047857" /> Score 9.2/10
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 03 */}
              <div style={{ position: 'absolute', inset: 0, opacity: activeStep === 2 ? 1 : 0, transform: activeStep === 2 ? 'translateY(0) scale(1)' : activeStep > 2 ? 'translateY(-48px) scale(0.97)' : 'translateY(48px) scale(0.97)', transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)', pointerEvents: activeStep === 2 ? 'all' : 'none' }}>
                <div style={{ background: 'white', border: '1px solid rgba(14,116,144,0.2)', borderRadius: '28px', padding: '36px', boxShadow: '0 8px 40px rgba(14,116,144,0.08)', height: '100%', display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(14,116,144,0.06)', border: '1px solid rgba(14,116,144,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BarChart2 size={26} color="#0E7490" />
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 900, fontFamily: '"Montserrat",sans-serif', color: '#0E7490', letterSpacing: '0.1em' }}>ÉTAPE 03</div>
                        <h3 style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: '20px', color: '#1C1917', margin: '3px 0 0' }}>Suivez vos progrès</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: '15px', color: '#57534E', lineHeight: 1.7, margin: 0 }}>Chaque séance est enregistrée. Comparez vos performances semaine par semaine et ajustez avec votre coach IA.</p>
                  </div>
                  <div style={{ width: '220px', flexShrink: 0, background: '#FAF8ED', border: '1px solid #E5E1D0', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ fontSize: '11px', color: '#A8A29E', marginBottom: '8px', fontWeight: 600, fontFamily: '"Montserrat",sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}><TrendingUp size={11} color="#A8A29E" /> Distance 8 sem.</div>
                    <svg width="100%" height="52" viewBox="0 0 180 52">
                      <defs><linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0E7490" stopOpacity="0.15"/><stop offset="100%" stopColor="#0E7490" stopOpacity="0"/></linearGradient></defs>
                      <path d="M0 42 L22 36 L45 32 L67 38 L90 26 L112 22 L135 16 L157 10 L180 13 L180 52 L0 52Z" fill="url(#sGrad)" />
                      <path d="M0 42 L22 36 L45 32 L67 38 L90 26 L112 22 L135 16 L157 10 L180 13" stroke="#0E7490" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#A8A29E', marginTop: '4px' }}>
                      {['S45','S47','S49','S51','S52'].map(s => <span key={s}>{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>

            </div>{/* /cards stack */}

            {/* Side step indicator */}
            <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' }}>
              {['01','02','03'].map((n, i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease', opacity: activeStep === i ? 1 : 0.3 }}>
                  <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: '"Montserrat",sans-serif', color: activeStep === i ? '#EA580C' : '#A8A29E' }}>{n}</div>
                  <div style={{ width: '4px', height: activeStep === i ? '32px' : '12px', borderRadius: '2px', background: activeStep === i ? '#EA580C' : '#D6CDB8', transition: 'all 0.4s ease' }} />
                </div>
              ))}
            </div>

          </div>{/* /sticky inner */}
        </div>{/* /tall wrapper */}
      </section>

      {/* ── COMPARISON ────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge badge-teal" style={{ marginBottom: '16px', display: 'inline-flex' }}>✦ Comparaison</span>
          <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.02em' }}>
            Pourquoi choisir <span style={{ background: 'linear-gradient(135deg,#EA580C,#D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Élan</span> ?
          </h2>
        </div>
        <div className="reveal" style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(28,25,23,0.06)' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0', background: '#F5F3E7', borderBottom: '1px solid #E5E1D0', padding: '16px 24px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif', color: '#A8A29E' }}>Fonctionnalité</span>
            {[{name:'Élan',color:'#EA580C',featured:true},{name:'Strava',color:'#57534E',featured:false},{name:'Garmin',color:'#57534E',featured:false}].map(({name,color,featured}) => (
              <div key={name} style={{ textAlign: 'center', padding: '8px 20px', background: featured ? 'rgba(234,88,12,0.08)' : 'transparent', borderRadius: featured ? '10px' : '0', border: featured ? '1px solid rgba(234,88,12,0.2)' : 'none' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: '"Montserrat",sans-serif', color: color }}>{name}</span>
              </div>
            ))}
          </div>
          {comparisons.map((row, i) => (
            <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0', padding: '14px 24px', borderBottom: i < comparisons.length - 1 ? '1px solid #F5F3E7' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#1C1917', fontWeight: 500 }}>{row.feature}</span>
              <div style={{ textAlign: 'center', padding: '0 20px', background: 'rgba(234,88,12,0.04)' }}>{c(row.elan)}</div>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>{c(row.strava)}</div>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>{c(row.garmin)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: '#F5F3E7', borderTop: '1px solid #E5E1D0', padding: '100px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-orange" style={{ marginBottom: '16px', display: 'inline-flex' }}>✦ Tarifs</span>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#1C1917', margin: '0 0 16px', letterSpacing: '-0.03em' }}>Simple, transparent, honnête</h2>
            {/* Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'white', border: '1px solid #E5E1D0', borderRadius: '999px', padding: '6px 20px', boxShadow: '0 1px 4px rgba(28,25,23,0.07)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: !billingYearly ? '#1C1917' : '#A8A29E' }}>Mensuel</span>
              <button onClick={() => setBillingYearly(y => !y)} style={{ width: '44px', height: '24px', borderRadius: '999px', background: billingYearly ? '#EA580C' : '#E5E1D0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s ease' }}>
                <span style={{ position: 'absolute', top: '3px', left: billingYearly ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.25s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
              </button>
              <span style={{ fontSize: '13px', fontWeight: 600, color: billingYearly ? '#1C1917' : '#A8A29E' }}>Annuel</span>
              {billingYearly && <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>-20%</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
            {plans.map((plan) => (
              <div key={plan.name} className={`pricing-card reveal${plan.featured ? ' featured' : ''}`}>
                {plan.featured && (
                  <div style={{ background: '#EA580C', color: 'white', fontSize: '11px', fontWeight: 800, fontFamily: '"Montserrat",sans-serif', padding: '4px 14px', borderRadius: '999px', display: 'inline-flex', marginBottom: '16px', letterSpacing: '0.06em', alignItems: 'center', gap: '5px' }}><Star size={11} fill="white" color="white" /> LE PLUS POPULAIRE</div>
                )}
                <h3 style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '20px', color: '#1C1917', margin: '0 0 4px' }}>{plan.name}</h3>
                <p style={{ fontSize: '13px', color: '#57534E', margin: '0 0 20px' }}>{plan.desc}</p>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '48px', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: plan.featured ? '#EA580C' : '#1C1917', letterSpacing: '-0.04em' }}>{plan.price === 0 ? 'Gratuit' : `${plan.price}€`}</span>
                  {plan.price > 0 && <span style={{ fontSize: '14px', color: '#A8A29E', marginLeft: '4px' }}>/mois</span>}
                  {billingYearly && plan.price > 0 && <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600, marginTop: '4px' }}>soit {plan.yearlyPrice}€/an</div>}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#57534E' }}>
                      <span className="comparison-check">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" style={{ display: 'block' }}>
                  <button style={{ width: '100%', padding: '13px', borderRadius: '12px', fontFamily: '"Montserrat",sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: plan.featured ? 'none' : '2px solid #EA580C', background: plan.featured ? '#EA580C' : 'transparent', color: plan.featured ? 'white' : '#EA580C', transition: 'all 0.2s ease' } as React.CSSProperties}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-2px)'; b.style.boxShadow = plan.featured ? '0 8px 24px rgba(234,88,12,0.35)' : '0 4px 16px rgba(234,88,12,0.15)'; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'none'; b.style.boxShadow = 'none'; }}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: '100px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="badge badge-earth" style={{ marginBottom: '16px', display: 'inline-flex' }}>✦ Témoignages</span>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.03em' }}>
            Ils courent le monde avec <span style={{ background: 'linear-gradient(135deg,#EA580C,#D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Élan</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>
          {testimonials.map((t, i) => (
            <div key={t.name} className={`card card-hover reveal reveal-delay-${i + 1}`} style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={14} style={{ fill: '#EA580C', color: '#EA580C' }} />)}
              </div>
              <p style={{ fontSize: '15px', color: '#1C1917', lineHeight: 1.75, margin: '0 0 20px', fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F5F3E7' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#EA580C,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: 'white', fontFamily: '"Montserrat",sans-serif', flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#A8A29E' }}>{t.role} · {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ background: '#F5F3E7', borderTop: '1px solid #E5E1D0', padding: '100px 24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="badge badge-green" style={{ marginBottom: '16px', display: 'inline-flex' }}>✦ FAQ</span>
            <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#1C1917', margin: 0, letterSpacing: '-0.02em' }}>Questions fréquentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="topo-bg" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-orange reveal" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={12} color="#EA580C" /> Rejoins 5 200+ sportifs voyageurs</span>
          <h2 className="reveal" style={{ fontSize: 'clamp(28px,6vw,64px)', fontFamily: '"Montserrat",sans-serif', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.04em', margin: '0 0 20px' }}>
            Votre prochaine aventure<br />
            <span style={{ background: 'linear-gradient(135deg,#EA580C,#D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>commence ici</span>
          </h2>
          <p className="reveal" style={{ fontSize: '18px', color: '#57534E', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.7 }}>14 jours gratuits · Aucune CB · Annulable à tout moment</p>
          <div className="reveal" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login">
              <button className="btn-primary" style={{ fontSize: '17px', padding: '16px 40px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Démarrer gratuitement <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#1C1917', color: '#A8A29E', padding: '60px 24px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <ElanLogo size={34} />
                <span style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '18px', color: 'white' }}>élan</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '20px', maxWidth: '260px' }}>L'application de coaching sportif et nutritionnel pour les voyageurs du monde entier.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['GDPR', 'SOC2', '4.9 / 5'].map(b => <span key={b} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#A8A29E', fontWeight: 600 }}>{b}</span>)}
              </div>
            </div>
            {[
              { title: 'Produit', links: ['Parcours IA', 'Nutrition', 'Suivi performance', 'Coach IA', 'Tarifs'] },
              { title: 'Entreprise', links: ['À propos', 'Blog', 'Presse', 'Recrutement', 'Contact'] },
              { title: 'Légal', links: ['Confidentialité', 'CGU', 'Cookies', 'Mentions légales'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 800, fontSize: '13px', color: 'white', marginBottom: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{col.title}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(l => <li key={l} style={{ fontSize: '14px', cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#EA580C'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#A8A29E'}>{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '13px' }}>© 2026 Élan. Tous droits réservés.</span>
            <span style={{ fontSize: '12px' }}>Fait avec ❤️ pour les sportifs voyageurs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
