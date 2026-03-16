"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { Navbar } from "./Navbar";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#FAF8ED' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid #E5E1D0', borderTopColor: '#EA580C', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#A8A29E', fontSize: '14px', fontWeight: 600, fontFamily: '"Montserrat",sans-serif' }}>Chargement…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF8ED' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: '240px' }}>
        <Navbar title={title} />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
