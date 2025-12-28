"use client";

import { useCallback, useMemo, useState } from "react";
import type { CustomPackage } from "@/lib/brew-commands";

export function useCustomPackages(
  initialPackages: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }> = [],
  sharedTokens: Set<string> = new Set(),
) {
  const [customPackages, setCustomPackages] = useState<
    Map<string, CustomPackage>
  >(
    new Map(
      initialPackages.map((pkg) => [
        pkg.token,
        { token: pkg.token, name: pkg.name, type: pkg.type },
      ]),
    ),
  );

  const [selectedCustomPackages, setSelectedCustomPackages] = useState<
    Set<string>
  >(new Set(initialPackages.map((pkg) => pkg.token)));

  const toggleCustomPackage = useCallback((token: string) => {
    setSelectedCustomPackages((prev) => {
      const next = new Set(prev);
      if (next.has(token)) {
        next.delete(token);
      } else {
        next.add(token);
      }
      return next;
    });
  }, []);

  const addCustomPackage = useCallback((pkg: CustomPackage) => {
    setCustomPackages((prev) => {
      const next = new Map(prev);
      if (!next.has(pkg.token)) {
        next.set(pkg.token, pkg);
      }
      return next;
    });
  }, []);

  const removeCustomPackage = useCallback(
    (token: string) => {
      if (sharedTokens.has(token)) {
        setSelectedCustomPackages((prev) => {
          const next = new Set(prev);
          next.delete(token);
          return next;
        });
      } else {
        setCustomPackages((prev) => {
          const next = new Map(prev);
          next.delete(token);
          return next;
        });
        setSelectedCustomPackages((prev) => {
          const next = new Set(prev);
          next.delete(token);
          return next;
        });
      }
    },
    [sharedTokens],
  );

  const selectedCustomPackagesMap = useMemo(() => {
    const map = new Map<string, CustomPackage>();
    for (const token of selectedCustomPackages) {
      const pkg = customPackages.get(token);
      if (pkg) {
        map.set(token, pkg);
      }
    }
    return map;
  }, [selectedCustomPackages, customPackages]);

  return {
    customPackages,
    selectedCustomPackages,
    selectedCustomPackagesMap,
    toggleCustomPackage,
    addCustomPackage,
    removeCustomPackage,
  };
}
