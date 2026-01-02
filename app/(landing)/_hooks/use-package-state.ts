"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { CURATED_APPS_BY_ID } from "@/lib/data/curated-catalogue";
import type { FullCatalogPackage } from "@/lib/helpers/brew-commands";
import { generateBulkBrewCommand } from "@/lib/helpers/brew-commands";
import { usePackageStore } from "./use-package-store";

/**
 * Single optimized selector that computes all derived state at once.
 * This replaces multiple individual hooks to reduce store subscriptions.
 */
export function usePackageState() {
  const state = usePackageStore(
    useShallow((s) => ({
      selectedAppIds: s.selectedAppIds,
      fullCatalogPackages: s.fullCatalogPackages,
      selectedFullCatalogPackageIds: s.selectedFullCatalogPackageIds,
      hydrated: s.hydrated,
    })),
  );

  return useMemo(() => {
    if (!state.hydrated) {
      return {
        selectedApps: new Set<string>(),
        fullCatalogPackages: new Map<string, FullCatalogPackage>(),
        selectedFullCatalogPackages: new Set<string>(),
        selectedCount: 0,
        selectedAppNames: [] as string[],
        selectedTokens: new Set<string>(),
        brewCommand: "",
        uninstallCommand: "",
        hydrated: false,
      };
    }

    // Compute all derived values in one place
    const selectedApps = new Set(state.selectedAppIds);
    const selectedFullCatalogPackages = new Set(
      state.selectedFullCatalogPackageIds,
    );

    const fullCatalogPackages = new Map(
      state.fullCatalogPackages.map((pkg) => [pkg.token, pkg]),
    );

    const selectedCount =
      state.selectedAppIds.length + state.selectedFullCatalogPackageIds.length;

    const selectedAppNames = state.selectedAppIds
      .map((appId) => CURATED_APPS_BY_ID.get(appId)?.brewName)
      .filter((name): name is string => Boolean(name));

    // Compute selected tokens (brew names from curated + full catalog tokens)
    const selectedTokens = new Set<string>();
    for (const appId of state.selectedAppIds) {
      const app = CURATED_APPS_BY_ID.get(appId);
      if (app) {
        selectedTokens.add(app.brewName);
      }
    }
    for (const token of state.selectedFullCatalogPackageIds) {
      selectedTokens.add(token);
    }

    // Compute selected full catalog packages map for brew commands
    const selectedFullCatalogPackagesMap = new Map<
      string,
      FullCatalogPackage
    >();
    const selectedSet = new Set(state.selectedFullCatalogPackageIds);
    for (const pkg of state.fullCatalogPackages) {
      if (selectedSet.has(pkg.token)) {
        selectedFullCatalogPackagesMap.set(pkg.token, pkg);
      }
    }

    // Generate brew commands
    const brewCommand = generateBulkBrewCommand(
      Array.from(selectedApps),
      selectedFullCatalogPackagesMap,
      "install",
    );

    const uninstallCommand = generateBulkBrewCommand(
      Array.from(selectedApps),
      selectedFullCatalogPackagesMap,
      "uninstall",
    );

    return {
      selectedApps,
      fullCatalogPackages,
      selectedFullCatalogPackages,
      selectedCount,
      selectedAppNames,
      selectedTokens,
      brewCommand,
      uninstallCommand,
      hydrated: true,
    };
  }, [state]);
}

// Convenience selectors for backward compatibility
export function useSelectedApps() {
  const { selectedApps, hydrated } = usePackageState();
  return hydrated ? selectedApps : new Set<string>();
}

export function useSelectedFullCatalogPackages() {
  const { selectedFullCatalogPackages, hydrated } = usePackageState();
  return hydrated ? selectedFullCatalogPackages : new Set<string>();
}
