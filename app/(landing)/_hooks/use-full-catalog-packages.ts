"use client";

import { useCallback, useMemo, useState } from "react";
import { useIsomorphicLayoutEffect, useLocalStorage } from "usehooks-ts";
import type { CustomPackage } from "@/lib/helpers/brew-commands";

export function useFullCatalogPackages(
  initialPackages: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }> = [],
  sharedTokens: Set<string> = new Set(),
) {
  const [mounted, setMounted] = useState(false);
  const [customPackagesArray, setCustomPackagesArray] = useLocalStorage<
    CustomPackage[]
  >(
    "installkit-full-catalog-packages",
    initialPackages.map((pkg) => ({
      token: pkg.token,
      name: pkg.name,
      type: pkg.type,
    })),
  );

  const [selectedCustomPackageIds, setSelectedCustomPackageIds] =
    useLocalStorage<string[]>(
      "installkit-selected-full-catalog-packages",
      initialPackages.map((pkg) => pkg.token),
    );

  // Use initial values during SSR, localStorage values after hydration
  const effectiveCustomPackages = mounted
    ? customPackagesArray
    : initialPackages.map((pkg) => ({
        token: pkg.token,
        name: pkg.name,
        type: pkg.type,
      }));
  const effectiveSelectedIds = mounted
    ? selectedCustomPackageIds
    : initialPackages.map((pkg) => pkg.token);

  const customPackages = useMemo(
    () => new Map(effectiveCustomPackages.map((pkg) => [pkg.token, pkg])),
    [effectiveCustomPackages],
  );

  const selectedCustomPackages = useMemo(
    () => new Set(effectiveSelectedIds),
    [effectiveSelectedIds],
  );

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  const toggleCustomPackage = useCallback(
    (token: string) => {
      if (!mounted) return; // Don't update during SSR
      setSelectedCustomPackageIds((prev) => {
        const currentSet = new Set(prev);
        if (currentSet.has(token)) {
          currentSet.delete(token);
        } else {
          currentSet.add(token);
        }
        return Array.from(currentSet);
      });
    },
    [setSelectedCustomPackageIds, mounted],
  );

  const addCustomPackage = useCallback(
    (pkg: CustomPackage) => {
      if (!mounted) return; // Don't update during SSR
      setCustomPackagesArray((prev) => {
        const exists = prev.some((p) => p.token === pkg.token);
        if (!exists) {
          return [...prev, pkg];
        }
        return prev;
      });
    },
    [setCustomPackagesArray, mounted],
  );

  const removeCustomPackage = useCallback(
    (token: string) => {
      if (!mounted) return; // Don't update during SSR
      if (sharedTokens.has(token)) {
        setSelectedCustomPackageIds((prev) => {
          const currentSet = new Set(prev);
          currentSet.delete(token);
          return Array.from(currentSet);
        });
      } else {
        setCustomPackagesArray((prev) =>
          prev.filter((pkg) => pkg.token !== token),
        );
        setSelectedCustomPackageIds((prev) => {
          const currentSet = new Set(prev);
          currentSet.delete(token);
          return Array.from(currentSet);
        });
      }
    },
    [
      sharedTokens,
      setCustomPackagesArray,
      setSelectedCustomPackageIds,
      mounted,
    ],
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
