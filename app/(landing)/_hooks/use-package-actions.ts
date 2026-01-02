"use client";

import { useCallback } from "react";
import { CURATED_APPS_BY_BREW_NAME } from "@/lib/data/curated-catalogue";
import type { SearchResult } from "@/lib/integrations/search";
import { useFullCatalog } from "./use-full-catalog";
import { usePackageStore } from "./use-package-store";

/**
 * Package actions that require additional logic beyond store actions.
 */
export function usePackageActions(sharedFullCatalogTokens: Set<string>) {
  const { getPackage } = useFullCatalog();

  // Get store actions
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
      const existingApp = CURATED_APPS_BY_BREW_NAME.get(pkg.token);
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
    toggleApp,
    toggleFullCatalogPackage,
    removeFullCatalogPackage,
    handleSelectPackage,
    clearAll,
  };
}
