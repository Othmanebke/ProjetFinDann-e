"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Zap, Shield, Star } from "lucide-react";

const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
  ENTERPRISE_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_enterprise_monthly",
};

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    icon: <Star className="h-5 w-5" />,
    description: "Pour commencer",
    features: [
      "3 projets maximum",
      "10 tâches par projet",
      "Chat IA basique (5/jour)",
      "1 membre d'équipe",
      "Support communautaire",
    ],
    color: "slate",
    priceId: null,
  },
  {
    id: "PRO",
    name: "Pro",
    price: 29,
    icon: <Zap className="h-5 w-5" />,
    description: "Pour les équipes",
    features: [
      "Projets illimités",
      "Tâches illimitées",
      "IA avancée (GPT-4o)",
      "Génération de plans IA",
      "Analyse des risques IA",
      "10 membres d'équipe",
      "Support prioritaire",
      "Analytics avancés",
    ],
    color: "primary",
    priceId: STRIPE_PRICES.PRO_MONTHLY,
    highlight: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 99,
    icon: <Shield className="h-5 w-5" />,
    description: "Pour les grandes organisations",
    features: [
      "Tout Pro inclus",
      "Membres illimités",
      "SSO / SAML",
      "SLA garanti 99.9%",
      "Intégrations custom",
      "Manager dédié",
      "Audit logs",
      "Data residency EU",
    ],
    color: "slate",
    priceId: STRIPE_PRICES.ENTERPRISE_MONTHLY,
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
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Current Subscription Status */}
        {!isLoading && subscription && (
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Abonnement actuel</h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400 text-sm px-3 py-1">
                    {currentPlan}
                  </span>
                  <span className={`badge text-xs ${
                    subscription.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                    subscription.status === "PAST_DUE" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-slate-400 mt-2">
                    Renouvellement le{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
              {currentPlan !== "FREE" && (
                <button onClick={handlePortal} className="btn-secondary text-sm">
                  Gérer l'abonnement
                </button>
              )}
            </div>
          </div>
        )}

        {/* Plans */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choisissez votre plan</h2>
          <p className="text-slate-500 mb-6">14 jours d'essai gratuit sur Pro et Enterprise. Sans engagement.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isHighlight = plan.highlight;

              return (
                <div
                  key={plan.id}
                  className={`card p-6 relative ${isHighlight ? "border-primary-300 ring-2 ring-primary-500 dark:border-primary-700" : ""}`}
                >
                  {isHighlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="badge bg-primary-600 text-white px-3 py-1 text-xs">⭐ Recommandé</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isHighlight ? "bg-primary-100 text-primary-600 dark:bg-primary-950" : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                    }`}>
                      {plan.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{plan.name}</div>
                      <div className="text-xs text-slate-400">{plan.description}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}€</span>
                    <span className="text-slate-400">/mois</span>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-lg text-sm font-medium text-center bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Plan actuel
                    </div>
                  ) : plan.priceId ? (
                    <button
                      onClick={() => handleUpgrade(plan.priceId!, plan.id)}
                      disabled={loadingPlan === plan.id}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isHighlight
                          ? "bg-primary-600 text-white hover:bg-primary-700"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      {loadingPlan === plan.id ? "Redirection…" : `Passer à ${plan.name}`}
                    </button>
                  ) : (
                    <button className="w-full py-2.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                      Commencer gratuitement
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center text-sm text-slate-400">
          Questions ? <a href="mailto:support@smartproject.ai" className="text-primary-600 hover:underline">support@smartproject.ai</a>
        </div>
      </div>
    </AppLayout>
  );
}
