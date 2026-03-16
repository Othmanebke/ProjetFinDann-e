"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Zap, Shield, Star } from "lucide-react";

const STRIPE_PRICES = {
  PREMIUM_COACH_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_COACH_MONTHLY || "price_premium_coach_monthly",
  PASS_VOYAGEUR_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PASS_VOYAGEUR_MONTHLY || "price_pass_voyageur_monthly",
};

const plans = [
  {
    id: "FREE",
    name: "Liberté",
    price: 0,
    icon: <Star className="h-5 w-5" />,
    description: "Pour commencer l'aventure",
    color: '#57534E',
    accentBg: 'rgba(87,83,78,0.08)',
    features: [
      "3 parcours IA par mois",
      "5 messages Coach IA",
      "10 logs nutrition",
      "Séances illimitées",
      "Support communautaire",
    ],
    priceId: null,
    featured: false,
  },
  {
    id: "PREMIUM_COACH",
    name: "Coach Premium",
    price: 29,
    icon: <Zap className="h-5 w-5" />,
    description: "Parcours illimités, nutrition IA, analyse performance",
    color: '#EA580C',
    accentBg: 'rgba(234,88,12,0.08)',
    features: [
      "30 parcours IA par mois",
      "100 messages Coach IA",
      "Logs nutrition illimités",
      "Analyse performance IA",
      "Recommandations restaurants",
      "Support prioritaire",
      "Analytics avancés",
    ],
    priceId: STRIPE_PRICES.PREMIUM_COACH_MONTHLY,
    featured: true,
  },
  {
    id: "PASS_VOYAGEUR",
    name: "Pass Voyageur",
    price: 99,
    icon: <Shield className="h-5 w-5" />,
    description: "Tout illimité + coach personnel IA + SMS reminders",
    color: '#047857',
    accentBg: 'rgba(4,120,87,0.08)',
    features: [
      "Parcours illimités",
      "Coach IA illimité",
      "SMS rappels entraînement",
      "Coach personnel IA dédié",
      "Accès API",
      "SLA garanti 99.9%",
      "Support VIP",
    ],
    priceId: STRIPE_PRICES.PASS_VOYAGEUR_MONTHLY,
    featured: false,
  },
];

export default function BillingPage() {
  const { data: subscription, isLoading } = useSWR("/billing/subscription");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlan = subscription?.plan || "FREE";

  const handleUpgrade = async (priceId: string, planName: string) => {
    setLoadingPlan(planName);
    try {
      const { data } = await api.post("/billing/checkout", { priceId });
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la redirection Stripe");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    try {
      const { data } = await api.get("/billing/portal");
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur portal Stripe");
    }
  };

  return (
    <AppLayout title="Abonnement">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 0', background: '#FAF8ED', minHeight: '100vh' }}>

        {/* Current subscription status */}
        {!isLoading && subscription && (
          <div style={{ background: 'white', border: '1px solid #E5E1D0', borderRadius: '20px', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 4px rgba(28,25,23,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontWeight: 800, color: '#1C1917', margin: '0 0 10px', fontFamily: '"Montserrat",sans-serif', fontSize: '16px' }}>Abonnement actuel</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-orange" style={{ fontSize: '12px' }}>{currentPlan}</span>
                  <span className={`badge ${subscription.status === "ACTIVE" ? "badge-green" : subscription.status === "PAST_DUE" ? "" : ""}`} style={{
                    fontSize: '11px',
                    background: subscription.status === "ACTIVE" ? 'rgba(4,120,87,0.1)' : subscription.status === "PAST_DUE" ? 'rgba(220,38,38,0.1)' : '#F5F3E7',
                    color: subscription.status === "ACTIVE" ? '#047857' : subscription.status === "PAST_DUE" ? '#DC2626' : '#57534E',
                    border: `1px solid ${subscription.status === "ACTIVE" ? 'rgba(4,120,87,0.2)' : subscription.status === "PAST_DUE" ? 'rgba(220,38,38,0.2)' : '#E5E1D0'}`,
                    borderRadius: '999px', padding: '3px 10px', fontWeight: 700, fontFamily: '"Montserrat",sans-serif',
                  }}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.currentPeriodEnd && (
                  <p style={{ fontSize: '13px', color: '#A8A29E', marginTop: '8px' }}>
                    Renouvellement le {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
              {currentPlan !== "FREE" && (
                <button onClick={handlePortal} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                  Gérer l'abonnement
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1C1917', margin: '0 0 8px', fontFamily: '"Montserrat",sans-serif', letterSpacing: '-0.02em' }}>Choisissez votre plan</h2>
          <p style={{ color: '#57534E', fontSize: '14px', margin: 0 }}>14 jours d'essai gratuit sur Coach Premium et Pass Voyageur. Sans engagement.</p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                style={{
                  background: plan.featured ? 'linear-gradient(135deg,#FFF7F0,#FFF3E0)' : 'white',
                  border: `1px solid ${plan.featured ? '#EA580C' : '#E5E1D0'}`,
                  borderRadius: '24px', padding: '28px', position: 'relative',
                  boxShadow: plan.featured ? '0 0 0 4px rgba(234,88,12,0.08), 0 8px 30px rgba(234,88,12,0.12)' : '0 1px 4px rgba(28,25,23,0.05)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
              >
                {plan.featured && (
                  <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)' }}>
                    <span style={{ background: '#EA580C', color: 'white', fontSize: '10px', fontWeight: 800, padding: '4px 14px', borderRadius: '999px', fontFamily: '"Montserrat",sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>⭐ RECOMMANDÉ</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: plan.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.color }}>
                    {plan.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#1C1917', fontFamily: '"Montserrat",sans-serif' }}>{plan.name}</div>
                    <div style={{ fontSize: '11px', color: '#A8A29E' }}>{plan.description}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '42px', fontWeight: 900, color: plan.featured ? '#EA580C' : '#1C1917', fontFamily: '"Montserrat",sans-serif', letterSpacing: '-0.04em' }}>{plan.price}€</span>
                  <span style={{ color: '#A8A29E', fontSize: '14px' }}>/mois</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#57534E' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: `rgba(4,120,87,0.1)`, border: '1px solid rgba(4,120,87,0.2)', color: '#047857', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div style={{ width: '100%', padding: '11px', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, background: '#F5F3E7', color: '#A8A29E', fontFamily: '"Montserrat",sans-serif', boxSizing: 'border-box' }}>
                    Plan actuel
                  </div>
                ) : plan.priceId ? (
                  <button
                    onClick={() => handleUpgrade(plan.priceId!, plan.id)}
                    disabled={loadingPlan === plan.id}
                    style={{
                      width: '100%', padding: '11px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: '"Montserrat",sans-serif',
                      background: plan.featured ? '#EA580C' : 'transparent',
                      color: plan.featured ? 'white' : plan.color,
                      border: plan.featured ? 'none' : `2px solid ${plan.color}`,
                      opacity: loadingPlan === plan.id ? 0.7 : 1,
                    } as React.CSSProperties}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; if (!loadingPlan) { b.style.transform = 'translateY(-1px)'; b.style.boxShadow = plan.featured ? '0 6px 20px rgba(234,88,12,0.35)' : '0 4px 16px rgba(4,120,87,0.2)'; } }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'none'; b.style.boxShadow = 'none'; }}
                  >
                    {loadingPlan === plan.id ? "Redirection…" : `Passer à ${plan.name}`}
                  </button>
                ) : (
                  <button style={{ width: '100%', padding: '11px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: '1px solid #E5E1D0', background: 'transparent', color: '#57534E', transition: 'all 0.2s ease', fontFamily: '"Montserrat",sans-serif' } as React.CSSProperties}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#EA580C'; (e.currentTarget as HTMLButtonElement).style.color = '#EA580C'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E1D0'; (e.currentTarget as HTMLButtonElement).style.color = '#57534E'; }}
                  >
                    Commencer gratuitement
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#A8A29E' }}>
          Questions ? <a href="mailto:support@elan.run" style={{ color: '#EA580C', textDecoration: 'none', fontWeight: 600 }}>support@elan.run</a>
        </div>
      </div>
    </AppLayout>
  );
}
