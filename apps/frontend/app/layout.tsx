import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "SmartProject AI — Gestion de projets intelligente",
    template: "%s | SmartProject AI",
  },
  description:
    "Plateforme SaaS de gestion de projets avec automatisation IA. Planifiez, organisez et collaborez plus intelligemment.",
  keywords: ["gestion de projet", "IA", "productivité", "SaaS", "collaboration"],
  authors: [{ name: "SmartProject AI Team" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://smartproject.ai",
    siteName: "SmartProject AI",
    title: "SmartProject AI — Gestion de projets intelligente",
    description: "Plateforme SaaS de gestion de projets avec IA intégrée",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #334155",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
