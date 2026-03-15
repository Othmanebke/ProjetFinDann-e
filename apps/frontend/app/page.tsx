import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartProject AI — Gérez vos projets avec l'IA",
};

const features = [
  {
    icon: "🤖",
    title: "IA intégrée",
    description: "GPT-4o génère des plans, identifie les risques et crée des tâches automatiquement.",
  },
  {
    icon: "📊",
    title: "Tableau de bord temps réel",
    description: "Visualisez l'avancement, les KPIs et l'activité de votre équipe en un coup d'œil.",
  },
  {
    icon: "🔔",
    title: "Notifications intelligentes",
    description: "Rappels par email et SMS pour les deadlines et les mises à jour importantes.",
  },
  {
    icon: "🔒",
    title: "Sécurité enterprise",
    description: "OAuth2, JWT, chiffrement des données et conformité RGPD.",
  },
  {
    icon: "👥",
    title: "Collaboration en équipe",
    description: "Invitez des membres, assignez des rôles et suivez les contributions.",
  },
  {
    icon: "📈",
    title: "Métriques & Analytics",
    description: "Prometheus + Grafana pour un monitoring professionnel de votre productivité.",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Pour démarrer",
    features: ["3 projets", "10 tâches/projet", "Chat IA basique", "1 membre"],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    name: "Pro",
    price: "29",
    description: "Pour les équipes",
    features: ["Projets illimités", "Tâches illimitées", "IA avancée", "10 membres", "Support prioritaire"],
    cta: "Essai 14 jours",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "99",
    description: "Pour les grandes équipes",
    features: ["Tout Pro", "Membres illimités", "SSO / SAML", "SLA garanti", "Intégrations custom"],
    cta: "Contacter les ventes",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">SP</div>
            <span className="font-semibold text-slate-900 dark:text-white">SmartProject AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">Fonctionnalités</Link>
            <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">Tarifs</Link>
            <Link href="/login" className="btn-secondary text-sm px-4 py-2 rounded-lg">Connexion</Link>
            <Link href="/login" className="btn-primary text-sm">Démarrer gratuitement →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-sm text-primary-700 mb-8 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-400">
          <span>✨</span> Maintenant avec GPT-4o
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto">
          Gérez vos projets avec{" "}
          <span className="text-primary-600">l'intelligence artificielle</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          SmartProject AI automatise la planification, identifie les risques et génère des tâches intelligentes pour que votre équipe livre plus vite.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/login" className="btn-primary text-base px-8 py-3 rounded-xl">
            Commencer gratuitement →
          </Link>
          <Link href="#features" className="btn-secondary text-base px-8 py-3 rounded-xl">
            Voir la démo
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
          <span>✓ Aucune carte requise</span>
          <span>✓ 14 jours d'essai Pro</span>
          <span>✓ Annulation à tout moment</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 dark:bg-slate-900 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-xl text-slate-500">
              Une plateforme complète pour les équipes modernes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">Tarifs simples et transparents</h2>
            <p className="mt-4 text-xl text-slate-500">Commencez gratuitement, évoluez selon vos besoins</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card p-8 relative ${plan.highlight ? "border-primary-300 ring-2 ring-primary-500 dark:border-primary-700" : ""}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge bg-primary-600 text-white px-3 py-1">Populaire</span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-slate-500 text-sm font-medium mb-1">{plan.description}</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-slate-400">/mois</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-green-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full text-center block py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    plan.highlight
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-slate-400 text-sm">
          <p>© 2026 SmartProject AI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
