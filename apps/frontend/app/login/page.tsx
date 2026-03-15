import type { Metadata } from "next";
import Link from "next/link";
import { LoginButtons } from "@/components/auth/LoginButtons";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="mb-8 text-6xl">🚀</div>
          <h1 className="text-4xl font-bold mb-4">SmartProject AI</h1>
          <p className="text-primary-200 text-lg">
            Gérez vos projets avec l'intelligence artificielle. Planifiez, organisez, et livrez plus vite.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { value: "10x", label: "Plus rapide" },
              { value: "95%", label: "Satisfaction" },
              { value: "500+", label: "Équipes" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-primary-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
              <span>← Accueil</span>
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Bienvenue !
            </h2>
            <p className="mt-2 text-slate-500">
              Connectez-vous pour accéder à votre espace SmartProject AI.
            </p>
          </div>

          <LoginButtons />

          <p className="mt-8 text-center text-xs text-slate-400">
            En vous connectant, vous acceptez nos{" "}
            <Link href="/legal/terms" className="underline hover:text-slate-600">
              CGU
            </Link>{" "}
            et notre{" "}
            <Link href="/legal/privacy" className="underline hover:text-slate-600">
              Politique de confidentialité
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
