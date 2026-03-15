"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";

export default function AuthCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const store = useAuthStore();

  useEffect(() => {
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const error = params.get("error");

    if (error) {
      router.replace("/login?error=" + error);
      return;
    }

    if (!accessToken || !refreshToken) {
      router.replace("/login?error=missing_tokens");
      return;
    }

    store.setTokens(accessToken, refreshToken);

    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => {
        store.setUser(data);
        router.replace("/dashboard");
      })
      .catch(() => {
        store.logout();
        router.replace("/login?error=fetch_user_failed");
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-slate-500">Connexion en cours…</p>
      </div>
    </div>
  );
}
