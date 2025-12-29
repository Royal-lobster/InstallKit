"use client";

import * as React from "react";
import { useBoolean, useCopyToClipboard } from "usehooks-ts";
import { APPS } from "@/lib/data/apps";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { useAppSelection } from "./use-app-selection";
import { useBrewCommands } from "./use-brew-commands";
import { useCustomPackages } from "./use-custom-packages";

interface BrewPickerContextValue {
  // App selection
  selectedApps: Set<string>;
  toggleApp: (id: string) => void;
  clearAll: () => void;

  // Custom packages
  customPackages: Map<
    string,
    { token: string; name: string; type: "cask" | "formula" }
  >;
  selectedCustomPackages: Set<string>;
  selectedCustomPackagesMap: Map<
    string,
    { token: string; name: string; type: "cask" | "formula" }
  >;
  toggleCustomPackage: (token: string) => void;
  addCustomPackage: (pkg: {
    token: string;
    name: string;
    type: "cask" | "formula";
  }) => void;
  removeCustomPackage: (token: string) => void;

  // Commands
  brewCommand: string;
  uninstallCommand: string;
  selectedTokens: Set<string>;

  // UI state
  selectedCount: number;
  copied: boolean;
  isUninstallMode: boolean;
  isShareDialogOpen: boolean;

  // Actions
  onCopy: () => void;
  onToggleMode: () => void;
  onShare: () => void;
  onClearAll: () => void;
  setIsShareDialogOpen: (open: boolean) => void;

  // Shared data
  sharedAppIds: Set<string>;
  sharedCustomTokens: Set<string>;
  kitName?: string;
  kitDescription?: string;
}

const BrewPickerContext = React.createContext<BrewPickerContextValue | null>(
  null,
);

interface BrewPickerProviderProps {
  children: React.ReactNode;
  initialSelectedAppIds?: string[];
  initialCustomPackages?: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }>;
  kitName?: string;
  kitDescription?: string;
}

export function BrewPickerProvider({
  children,
  initialSelectedAppIds = [],
  initialCustomPackages = [],
  kitName,
  kitDescription,
}: BrewPickerProviderProps) {
  const sharedAppIds = React.useMemo(
    () => new Set(initialSelectedAppIds),
    [initialSelectedAppIds],
  );
  const sharedCustomTokens = React.useMemo(
    () => new Set(initialCustomPackages.map((pkg) => pkg.token)),
    [initialCustomPackages],
  );

  const { selectedApps, toggleApp, clearAll } = useAppSelection(
    initialSelectedAppIds,
  );

  const {
    customPackages,
    selectedCustomPackages,
    selectedCustomPackagesMap,
    toggleCustomPackage,
    addCustomPackage,
    removeCustomPackage,
  } = useCustomPackages(initialCustomPackages, sharedCustomTokens);

  const { brewCommand, uninstallCommand, selectedTokens } = useBrewCommands(
    selectedApps,
    selectedCustomPackagesMap,
  );

  const [copiedText, copy] = useCopyToClipboard();
  const { trackCopy } = useAnalytics();
  const uninstallMode = useBoolean(false);
  const shareDialog = useBoolean(false);

  const selectedCount = selectedApps.size + selectedCustomPackages.size;
  const displayCommand = uninstallMode.value ? uninstallCommand : brewCommand;
  const copied = copiedText === displayCommand;

  const handleCopy = () => {
    if (!displayCommand) return;

    // Track the copy event
    const selectedAppNames = Array.from(selectedApps)
      .map((appId) => APPS.find((app) => app.id === appId)?.brewName)
      .filter(Boolean) as string[];

    trackCopy({
      type: "brew_command",
      command: displayCommand,
      selectedAppsCount: selectedApps.size,
      customPackagesCount: selectedCustomPackages.size,
      isUninstallMode: uninstallMode.value,
      selectedApps: selectedAppNames,
    });

    copy(displayCommand);
  };

  const handleClearAll = () => {
    clearAll();
    if (customPackages.size > 0) {
      for (const token of customPackages.keys()) {
        if (!sharedCustomTokens.has(token)) {
          removeCustomPackage(token);
        }
      }
    }
  };

  const handleShare = () => {
    shareDialog.setTrue();
  };

  const value: BrewPickerContextValue = {
    selectedApps,
    toggleApp,
    clearAll,
    customPackages,
    selectedCustomPackages,
    selectedCustomPackagesMap,
    toggleCustomPackage,
    addCustomPackage,
    removeCustomPackage,
    brewCommand,
    uninstallCommand,
    selectedTokens,
    selectedCount,
    copied,
    isUninstallMode: uninstallMode.value,
    isShareDialogOpen: shareDialog.value,
    onCopy: handleCopy,
    onToggleMode: uninstallMode.toggle,
    onShare: handleShare,
    onClearAll: handleClearAll,
    setIsShareDialogOpen: shareDialog.setValue,
    sharedAppIds,
    sharedCustomTokens,
    kitName,
    kitDescription,
  };

  return (
    <BrewPickerContext.Provider value={value}>
      {children}
    </BrewPickerContext.Provider>
  );
}

export function useBrewPickerContext() {
  const context = React.useContext(BrewPickerContext);
  if (!context) {
    throw new Error(
      "useBrewPickerContext must be used within a BrewPickerProvider",
    );
  }
  return context;
}
