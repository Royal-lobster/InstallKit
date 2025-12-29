"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/get-query-client";

function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2025-05-24",
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
