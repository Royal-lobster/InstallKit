"use client";

import { useQuery } from "@tanstack/react-query";
import type { HomebrewInfo } from "@/lib/api/homebrew";
import { fetchHomebrewInfo } from "@/lib/api/homebrew";

export const homebrewInfoKeys = {
  all: ["homebrew-info"] as const,
  detail: (brewName: string) => [...homebrewInfoKeys.all, brewName] as const,
};

export function useHomebrewInfo(brewName: string, enabled = false) {
  return useQuery<HomebrewInfo, Error>({
    queryKey: homebrewInfoKeys.detail(brewName),
    queryFn: () => fetchHomebrewInfo(brewName),
    enabled,
    staleTime: Infinity,
  });
}
