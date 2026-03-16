import type { Metadata } from "next";
import Link from "next/link";
import { LoginButtons } from "@/components/auth/LoginButtons";
import Image from "next/image";

export const metadata: Metadata = { title: "Connexion — Élan" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Left — Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 overflow-hidden text-white">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop"
          alt="Runner in a beautiful landscape"
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />

        <div className="relative z-20 flex flex-col justify-end p-12 h-full w-full max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
             <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-xl shadow-orange-500/20">🏃</div>
             <span className="font-montserrat font-black text-3xl tracking-tight">élan</span>
          </div>

          <h1 className="font-montserrat font-black text-4xl lg:text-5xl tracking-tight mb-4 leading-tight">
            Votre routine sportive,<br />
            <span className="text-orange-500">sans frontières.</span>
          </h1>
          
          <p className="text-stone-300 text-lg max-w-md mb-12 leading-relaxed">
            Découvrez des parcours optimisés par l'IA dans plus de 127 villes à travers le monde. Maintenez vos objectifs où que vous soyez.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {[
              { value: "127+", label: "Villes actives" },
              { value: "4.9/5", label: "Note voyageurs" },
              { value: "10k+", label: "Parcours générés" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="font-montserrat font-black text-2xl lg:text-3xl tracking-tight text-white mb-1">{stat.value}</div>
                <div className="text-stone-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-orange-600 transition-colors mb-12"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
            Retour à l'accueil
          </Link>
          
          <div className="mb-8">
            <h2 className="font-montserrat font-black text-3xl text-stone-900 tracking-tight mb-2">
              Bienvenue !
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              Connectez-vous pour accéder à votre espace personnalisé et découvrir vos prochains parcours.
            </p>
          </div>

          <div className="mt-8">
            <LoginButtons />
          </div>

          <p className="mt-10 text-center text-xs text-stone-500 leading-relaxed">
            En vous connectant, vous acceptez nos{" "}
            <Link href="/legal/terms" className="text-orange-600 hover:text-orange-500 font-semibold transition-colors">
              Conditions Générales
            </Link>{" "}
            et notre{" "}
            <Link href="/legal/privacy" className="text-orange-600 hover:text-orange-500 font-semibold transition-colors">
              Politique de confidentialité
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
