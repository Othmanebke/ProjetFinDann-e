'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Activity, Map, Utensils, Bot,
  CreditCard, Settings, BarChart3, Shield, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/workouts',   label: 'Mes Séances',      icon: Activity },
  { href: '/routes',     label: 'Parcours',         icon: Map },
  { href: '/nutrition',  label: 'Nutrition',        icon: Utensils },
  { href: '/ai',         label: 'Coach IA',         icon: Bot },
  { href: '/billing',    label: 'Abonnement',       icon: CreditCard },
  { href: '/profile',    label: 'Profil',           icon: Settings },
  { href: '/metrics',    label: 'Métriques',        icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout, plan } = useAuth();
  const isPremium = plan === 'PREMIUM_COACH' || plan === 'PASS_VOYAGEUR';

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', background: 'rgba(10,10,26,0.95)',
      borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex',
      flexDirection: 'column', padding: '20px 12px', backdropFilter: 'blur(20px)',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '24px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
          🏃
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc', letterSpacing: '-0.02em' }}>Fit & Travel</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>Coaching IA</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div className={`sidebar-item${active ? ' active' : ''}`}>
                <Icon size={16} />
                <span>{label}</span>
              </div>
            </Link>
          );
        })}

        {isAdmin && (
          <Link href="/admin" style={{ textDecoration: 'none', marginTop: '8px' }}>
            <div className={`sidebar-item${pathname === '/admin' ? ' active' : ''}`} style={{ color: '#f43f5e' }}>
              <Shield size={16} />
              <span>Admin</span>
            </div>
          </Link>
        )}
      </nav>

      {/* Upgrade CTA */}
      {!isPremium && (
        <Link href="/billing" style={{ textDecoration: 'none', margin: '12px 0' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.1))', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '12px', padding: '12px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Zap size={14} style={{ color: '#a78bfa' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa' }}>Premium Coach</span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>Parcours illimités + Coach IA 24/7</p>
          </div>
        </Link>
      )}

      {/* User */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user?.avatarUrl
          ? <img src={user.avatarUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white' }}>
              {user?.name?.charAt(0) ?? '?'}
            </div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name ?? 'Sportif'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{plan ?? 'FREE'}</div>
        </div>
        <button onClick={logout} title="Déconnexion" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
