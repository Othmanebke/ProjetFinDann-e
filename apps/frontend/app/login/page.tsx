import type { Metadata } from "next";
import Link from "next/link";
import { LoginButtons } from "@/components/auth/LoginButtons";

export const metadata: Metadata = { title: "Connexion — Élan" };

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF8ED' }}>
      {/* Left — Branding */}
      <div style={{
        display: 'none',
        background: 'linear-gradient(135deg,#EA580C,#047857)',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '48px', position: 'relative', overflow: 'hidden',
      }} className="lg:flex lg:w-1/2">
        {/* Topo overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='0.8'%3E%3Cellipse cx='400' cy='400' rx='380' ry='200'/%3E%3Cellipse cx='400' cy='400' rx='300' ry='150'/%3E%3Cellipse cx='400' cy='400' rx='220' ry='100'/%3E%3Cellipse cx='400' cy='400' rx='140' ry='60'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: '500px 500px', backgroundPosition: 'center', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '380px', textAlign: 'center', position: 'relative', zIndex: 1, color: 'white' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>🏃</div>
            <span style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.04em' }}>élan</span>
          </div>

          <h1 style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '32px', letterSpacing: '-0.03em', marginBottom: '16px', lineHeight: 1.1 }}>
            Sport & Voyage,<br />sans compromis
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.85, lineHeight: 1.7, marginBottom: '40px' }}>
            Parcours IA sécurisés dans 127+ villes. Nutrition locale. Coach IA 24/7.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {[
              { value: "127+", label: "Villes" },
              { value: "4.9/5", label: "Satisfaction" },
              { value: "5 200+", label: "Sportifs" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px 8px', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.03em' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '32px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#57534E', fontSize: '13px', textDecoration: 'none', marginBottom: '28px', fontWeight: 600, transition: 'color 0.2s ease' }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#EA580C')}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#57534E')}
            >
              ← Accueil
            </Link>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg,#EA580C,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏃</div>
              <span style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '20px', color: '#1C1917', letterSpacing: '-0.03em' }}>élan</span>
            </div>
            <h2 style={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 900, fontSize: '26px', color: '#1C1917', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
              Bienvenue !
            </h2>
            <p style={{ fontSize: '14px', color: '#57534E', margin: 0, lineHeight: 1.6 }}>
              Connectez-vous pour accéder à votre espace Élan.
            </p>
          </div>

          <LoginButtons />

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#A8A29E', lineHeight: 1.6 }}>
            En vous connectant, vous acceptez nos{" "}
            <Link href="/legal/terms" style={{ color: '#EA580C', textDecoration: 'underline' }}>
              CGU
            </Link>{" "}
            et notre{" "}
            <Link href="/legal/privacy" style={{ color: '#EA580C', textDecoration: 'underline' }}>
              Politique de confidentialité
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
