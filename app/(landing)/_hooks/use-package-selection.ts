"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useFullCatalogue } from "@/app/(landing)/_hooks/use-full-catalogue";
import {
  useBrewCommands,
  useCustomPackages,
  usePackageStore,
  useSelectedAppNames,
  useSelectedApps,
  useSelectedCount,
  useSelectedCustomPackages,
  useSelectedTokens,
} from "@/app/(landing)/_hooks/use-package-store";
import { APPS } from "@/lib/data/apps";
import type { SearchResult } from "@/lib/integrations/search";

interface InitialPackage {
  token: string;
  name: string;
  type: "cask" | "formula";
}

export function usePackageSelection(
  initialSelectedAppIds: string[],
  initialCustomPackages: InitialPackage[],
) {
  const { getPackage } = useFullCatalogue();

  // Resolve package types for initial custom packages
  const resolvedInitialPackages = useMemo(() => {
    return initialCustomPackages.map((pkg) => {
      const cataloguePackage = getPackage(pkg.token);
      return {
        ...pkg,
        type: cataloguePackage?.type || pkg.type,
      };
    });
  }, [initialCustomPackages, getPackage]);

  // Shared tokens that came from URL
  const sharedCustomTokens = useMemo(
    () => new Set(resolvedInitialPackages.map((pkg) => pkg.token)),
    [resolvedInitialPackages],
  );

  // Initialize from URL on mount
  const initializeFromUrl = usePackageStore((state) => state.initializeFromUrl);
  const hydrated = usePackageStore((state) => state.hydrated);

  useEffect(() => {
    if (
      hydrated &&
      (initialSelectedAppIds.length > 0 || resolvedInitialPackages.length > 0)
    ) {
      initializeFromUrl(initialSelectedAppIds, resolvedInitialPackages);
    }
  }, [
    hydrated,
    initialSelectedAppIds,
    resolvedInitialPackages,
    initializeFromUrl,
  ]);

  // Get state from Zustand store
  const selectedApps = useSelectedApps();
  const customPackages = useCustomPackages();
  const selectedCustomPackages = useSelectedCustomPackages();
  const selectedCount = useSelectedCount();
  const selectedAppNames = useSelectedAppNames();
  const selectedTokens = useSelectedTokens();
  const { brewCommand, uninstallCommand } = useBrewCommands();

  // Get actions from Zustand store
  const toggleApp = usePackageStore((state) => state.toggleApp);
  const toggleCustomPackage = usePackageStore(
    (state) => state.toggleCustomPackage,
  );
  const addCustomPackage = usePackageStore((state) => state.addCustomPackage);
  const removeCustomPackageAction = usePackageStore(
    (state) => state.removeCustomPackage,
  );
  const clearAllAction = usePackageStore((state) => state.clearAll);

  // Wrap removeCustomPackage to include sharedTokens
  const removeCustomPackage = useCallback(
    (token: string) => {
      removeCustomPackageAction(token, sharedCustomTokens);
    },
    [removeCustomPackageAction, sharedCustomTokens],
  );

  // Wrap clearAll to include sharedTokens
  const clearAll = useCallback(() => {
    clearAllAction(sharedCustomTokens);
  }, [clearAllAction, sharedCustomTokens]);

  // Handle selecting a package from search
  const handleSelectPackage = useCallback(
    (pkg: SearchResult) => {
      // Check if it's a curated app first
      const existingApp = APPS.find((app) => app.brewName === pkg.token);
      if (existingApp) {
        toggleApp(existingApp.id);
        return;
      }

      // Resolve type from catalogue if available
      const cataloguePackage = getPackage(pkg.token);
      const resolvedType = cataloguePackage?.type || pkg.type;

      addCustomPackage({
        token: pkg.token,
        name: pkg.name,
        type: resolvedType,
      });

      toggleCustomPackage(pkg.token);
    },
    [toggleApp, addCustomPackage, toggleCustomPackage, getPackage],
  );

  return {
    // App selection
    selectedApps,
    toggleApp,

    // Custom package selection
    customPackages,
    selectedCustomPackages,
    sharedCustomTokens,
    toggleCustomPackage,
    removeCustomPackage,
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
