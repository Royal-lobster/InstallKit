"use client";

import * as React from "react";
import { useBoolean, useCopyToClipboard } from "usehooks-ts";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { useAppSelection } from "./use-app-selection";
import { useBrewCommands } from "./use-brew-commands";
import { useFullCatalogPackages } from "./use-full-catalog-packages";

interface InstallKitContextValue {
  // App selection
  selectedApps: Set<string>;
  toggleApp: (id: string) => void;
  clearAll: () => void;

  // Full catalog packages
  fullCatalogPackages: Map<
    string,
    { token: string; name: string; type: "cask" | "formula" }
  >;
  selectedFullCatalogPackages: Set<string>;
  selectedFullCatalogPackagesMap: Map<
    string,
    { token: string; name: string; type: "cask" | "formula" }
  >;
  toggleFullCatalogPackage: (token: string) => void;
  addFullCatalogPackage: (pkg: {
    token: string;
    name: string;
    type: "cask" | "formula";
  }) => void;
  removeFullCatalogPackage: (token: string) => void;

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
  setIsShareDialogOpen: (isOpen: boolean) => void;

  // Shared state
  sharedAppIds: Set<string>;
  sharedCustomTokens: Set<string>;
  kitName?: string;
  kitDescription?: string;
}

const InstallKitContext = React.createContext<InstallKitContextValue | null>(
  null,
);

interface InstallKitProviderProps {
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

export function InstallKitProvider({
  children,
  initialSelectedAppIds = [],
  initialCustomPackages = [],
  kitName,
  kitDescription,
}: InstallKitProviderProps) {
  const { selectedApps, toggleApp, clearAll } = useAppSelection(
    initialSelectedAppIds,
  );

  const {
    customPackages: fullCatalogPackages,
    selectedCustomPackages: selectedFullCatalogPackages,
    selectedCustomPackagesMap: selectedFullCatalogPackagesMap,
    toggleCustomPackage: toggleFullCatalogPackage,
    addCustomPackage: addFullCatalogPackage,
    removeCustomPackage: removeFullCatalogPackage,
  } = useFullCatalogPackages(initialCustomPackages);

  const { brewCommand, uninstallCommand, selectedTokens } = useBrewCommands(
    selectedApps,
    selectedFullCatalogPackagesMap,
  );

  const { trackCopy } = useAnalytics();
  const uninstallMode = useBoolean(false);
  const shareDialog = useBoolean(false);

  const selectedCount = selectedApps.size + selectedFullCatalogPackages.size;

  const [, copy] = useCopyToClipboard();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const command = uninstallMode.value ? uninstallCommand : brewCommand;
    copy(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    trackCopy({
      type: "brew_command",
      command: command,
      selectedAppsCount: selectedCount,
      isUninstallMode: uninstallMode.value,
    });
  };

  // Shared state from URL params
  const sharedAppIds = new Set(initialSelectedAppIds);
  const sharedCustomTokens = new Set(
    initialCustomPackages.map((pkg) => pkg.token),
  );

  const handleClearAll = () => {
    clearAll();
    if (fullCatalogPackages.size > 0) {
      for (const token of fullCatalogPackages.keys()) {
        if (!sharedCustomTokens.has(token)) {
          removeFullCatalogPackage(token);
        }
      }
    }
  };

  const handleShare = () => {
    shareDialog.setTrue();
  };

  const value: InstallKitContextValue = {
    selectedApps,
    toggleApp,
    clearAll,
    fullCatalogPackages,
    selectedFullCatalogPackages,
    selectedFullCatalogPackagesMap,
    toggleFullCatalogPackage,
    addFullCatalogPackage,
    removeFullCatalogPackage,
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
    <InstallKitContext.Provider value={value}>
      {children}
    </InstallKitContext.Provider>
  );
}

export function useInstallKit() {
  const context = React.useContext(InstallKitContext);
  if (!context) {
    throw new Error("useInstallKit must be used within an InstallKitProvider");
  }
  return context;
}
