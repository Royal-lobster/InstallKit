"use client";

import { use, useMemo } from "react";
import { CURATED_APPS } from "@/lib/data/curated-catalogue";
import type { HomepageSearchParams } from "../page";

export interface UrlParams {
  kitName: string | undefined;
  kitDescription: string | undefined;
  initialSelectedAppIds: string[];
  initialFullCatalogPackages: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }>;
}

export function useUrlParams({
  searchParams,
}: {
  searchParams: Promise<HomepageSearchParams>;
}): UrlParams {
  const params = use(searchParams);
  return useMemo(() => {
    const kitName = params.name || undefined;
    const kitDescription = params.description || undefined;
    const packagesParam = params.packages || "";

    const packageTokens = packagesParam
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const selectedAppIds: string[] = [];
    const externalTokens: string[] = [];

    for (const token of packageTokens) {
      const app = CURATED_APPS.find(
        (a) => a.id === token || a.brewName === token,
      );
      if (app) {
        selectedAppIds.push(app.id);
      } else if (token) {
        externalTokens.push(token);
      }
    }

    const initialFullCatalogPackages = externalTokens.map((token) => ({
      token,
      name: token,
      type: "cask" as const,
    }));

    return {
      kitName,
      kitDescription,
      initialSelectedAppIds: selectedAppIds,
      initialFullCatalogPackages,
    };
  }, [params]);
}
