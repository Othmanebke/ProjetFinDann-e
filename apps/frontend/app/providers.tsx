"use client";

import { SWRConfig } from "swr";
import { api } from "@/lib/api";

const swrFetcher = (url: string) => api.get(url).then((r) => r.data);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
