"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useFullCatalog } from "@/app/(landing)/_hooks/use-full-catalog";
import {
  useBrewCommands,
  useFullCatalogPackages,
  usePackageStore,
  useSelectedAppNames,
  useSelectedApps,
  useSelectedCount,
  useSelectedFullCatalogPackages,
  useSelectedTokens,
} from "@/app/(landing)/_hooks/use-package-store";
import { CURATED_APPS } from "@/lib/data/curated-catalogue";
import type { SearchResult } from "@/lib/integrations/search";

interface InitialPackage {
  token: string;
  name: string;
  type: "cask" | "formula";
}

export function usePackageSelection(
  initialSelectedAppIds: string[],
  initialFullCatalogPackages: InitialPackage[],
) {
  const { getPackage } = useFullCatalog();
  const params = useSearchParams();
  const hasKitName = params.get("name");

  // Resolve package types for initial full catalog packages
  const resolvedInitialPackages = useMemo(() => {
    return initialFullCatalogPackages.map((pkg) => {
      const catalogPackage = getPackage(pkg.token);
      return {
        ...pkg,
        type: catalogPackage?.type || pkg.type,
      };
    });
  }, [initialFullCatalogPackages, getPackage]);

  // Shared tokens that came from URL
  const sharedFullCatalogTokens = useMemo(
    () => new Set(resolvedInitialPackages.map((pkg) => pkg.token)),
    [resolvedInitialPackages],
  );

  // Initialize from URL on mount or when URL parameters change
  const initializeFromUrl = usePackageStore((state) => state.initializeFromUrl);
  const hydrated = usePackageStore((state) => state.hydrated);

  useEffect(() => {
    // Only initialize from URL if we have a kit name parameter
    // This allows persisted state to work when there's no kit name
    if (
      hydrated &&
      hasKitName &&
      (initialSelectedAppIds.length > 0 || resolvedInitialPackages.length > 0)
    ) {
      initializeFromUrl(initialSelectedAppIds, resolvedInitialPackages);
    }
  }, [
    hydrated,
    hasKitName,
    initialSelectedAppIds,
    resolvedInitialPackages,
    initializeFromUrl,
  ]);

  // Get state from Zustand store
  const selectedApps = useSelectedApps();
  const fullCatalogPackages = useFullCatalogPackages();
  const selectedFullCatalogPackages = useSelectedFullCatalogPackages();
  const selectedCount = useSelectedCount();
  const selectedAppNames = useSelectedAppNames();
  const selectedTokens = useSelectedTokens();
  const { brewCommand, uninstallCommand } = useBrewCommands();

  // Get actions from Zustand store
  const toggleApp = usePackageStore((state) => state.toggleApp);
  const toggleFullCatalogPackage = usePackageStore(
    (state) => state.toggleFullCatalogPackage,
  );
  const addFullCatalogPackage = usePackageStore(
    (state) => state.addFullCatalogPackage,
  );
  const removeFullCatalogPackageAction = usePackageStore(
    (state) => state.removeFullCatalogPackage,
  );
  const clearAllAction = usePackageStore((state) => state.clearAll);

  // Wrap removeFullCatalogPackage to include sharedTokens
  const removeFullCatalogPackage = useCallback(
    (token: string) => {
      removeFullCatalogPackageAction(token, sharedFullCatalogTokens);
    },
    [removeFullCatalogPackageAction, sharedFullCatalogTokens],
  );

  // Wrap clearAll to include sharedTokens
  const clearAll = useCallback(() => {
    clearAllAction(sharedFullCatalogTokens);
  }, [clearAllAction, sharedFullCatalogTokens]);

  // Handle selecting a package from search
  const handleSelectPackage = useCallback(
    (pkg: SearchResult) => {
      // Check if it's a curated app first
      const existingApp = CURATED_APPS.find(
        (app) => app.brewName === pkg.token,
      );
      if (existingApp) {
        toggleApp(existingApp.id);
        return;
      }

      // Resolve type from catalog if available
      const catalogPackage = getPackage(pkg.token);
      const resolvedType = catalogPackage?.type || pkg.type;

      addFullCatalogPackage({
        token: pkg.token,
        name: pkg.name,
        type: resolvedType,
      });

      toggleFullCatalogPackage(pkg.token);
    },
    [toggleApp, addFullCatalogPackage, toggleFullCatalogPackage, getPackage],
  );

  return {
    // App selection
    selectedApps,
    toggleApp,

    // Full catalog package selection
    fullCatalogPackages,
    selectedFullCatalogPackages,
    sharedFullCatalogTokens,
    toggleFullCatalogPackage,
    removeFullCatalogPackage,
    handleSelectPackage,

    // Derived values
    selectedCount,
    selectedAppNames,
    selectedTokens,
    brewCommand,
    uninstallCommand,

    // Actions
    clearAll,
  };
}
