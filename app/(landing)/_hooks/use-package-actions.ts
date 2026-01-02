"use client";

import { useCallback } from "react";
import { CURATED_APPS_BY_BREW_NAME } from "@/lib/data/curated-catalogue";
import type { SearchResult } from "@/lib/integrations/search";
import { useFullCatalog } from "./use-full-catalog";
import { usePackageStore } from "./use-package-store";

/**
 * Package actions that require additional logic beyond store actions.
 */
export function usePackageActions() {
  const { getPackage } = useFullCatalog();

  // Get store actions - no need for wrappers now
  const toggleApp = usePackageStore((state) => state.toggleApp);
  const toggleFullCatalogPackage = usePackageStore(
    (state) => state.toggleFullCatalogPackage,
  );
  const addFullCatalogPackage = usePackageStore(
    (state) => state.addFullCatalogPackage,
  );
  const removeFullCatalogPackage = usePackageStore(
    (state) => state.removeFullCatalogPackage,
  );
  const clearAll = usePackageStore((state) => state.clearAll);

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
