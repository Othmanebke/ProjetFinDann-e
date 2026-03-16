"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (store.accessToken && !store.user) {
      store.setLoading(true);
      api
        .get("/auth/me")
        .then(({ data }) => store.setUser(data))
        .catch(() => store.logout())
        .finally(() => store.setLoading(false));
    } else {
      store.setLoading(false);
    }
  }, [store.accessToken]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    logout: async () => {
      try {
        await api.post("/auth/logout", { refreshToken: store.refreshToken });
      } catch {}
      store.logout();
    },
    isAdmin: store.user?.role === "ADMIN",
    plan: store.user?.subscription?.plan || "FREE",
    isPremium: ["PREMIUM_COACH", "PASS_VOYAGEUR"].includes(store.user?.subscription?.plan || ""),
  };
}
