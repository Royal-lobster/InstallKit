"use client";

import { useMemo } from "react";
import { useHomebrewCatalogue } from "@/lib/hooks/use-catalogue";

export type HomebrewInfo = {
  name?: string;
  description?: string;
  homepage?: string;
  version?: string;
  url?: string;
  kind: "cask" | "formula";
};

export function useHomebrewInfo(brewName: string, enabled = false) {
  const { getPackage, isReady } = useHomebrewCatalogue();

  return useMemo(() => {
    if (!enabled || !isReady) {
      return {
        data: undefined,
        isLoading: !isReady && enabled,
        error: null,
      };
    }

    const pkg = getPackage(brewName);

    if (!pkg) {
      return {
        data: undefined,
        isLoading: false,
        error: null,
      };
    }

    const data: HomebrewInfo = {
      name: Array.isArray(pkg.name) ? pkg.name[0] : pkg.name,
      description: pkg.desc,
      homepage: pkg.homepage,
      version: pkg.version,
      url: `https://formulae.brew.sh/${pkg.type}/${pkg.token}`,
      kind: pkg.type,
    };

    return {
      data,
      isLoading: false,
      error: null,
    };
  }, [brewName, enabled, isReady, getPackage]);
}
