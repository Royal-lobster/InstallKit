"use client";

import { useMemo } from "react";
import {
  type CustomPackage,
  generateBulkBrewCommand,
} from "@/lib/brew-commands";
import { APPS } from "@/lib/data/apps";

export function useBrewCommands(
  selectedApps: Set<string>,
  selectedCustomPackagesMap: Map<string, CustomPackage>,
) {
  const selectedTokens = useMemo(() => {
    const tokens = new Set<string>();
    for (const appId of selectedApps) {
      const app = APPS.find((a) => a.id === appId);
      if (app) {
        tokens.add(app.brewName);
      }
    }
    for (const token of selectedCustomPackagesMap.keys()) {
      tokens.add(token);
    }
    return tokens;
  }, [selectedApps, selectedCustomPackagesMap]);

  const brewCommand = useMemo(
    () =>
      generateBulkBrewCommand(
        Array.from(selectedApps),
        selectedCustomPackagesMap,
        "install",
      ),
    [selectedApps, selectedCustomPackagesMap],
  );

  const uninstallCommand = useMemo(
    () =>
      generateBulkBrewCommand(
        Array.from(selectedApps),
        selectedCustomPackagesMap,
        "uninstall",
      ),
    [selectedApps, selectedCustomPackagesMap],
  );

  return {
    brewCommand,
    uninstallCommand,
    selectedTokens,
  };
}
