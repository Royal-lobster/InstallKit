"use client";

import * as React from "react";
import { useBoolean, useCopyToClipboard } from "usehooks-ts";
import { AppShell } from "@/app/(layout)/app-shell";
import type { App, AppCategory } from "@/lib/schema";
import { useAppSelection } from "../_hooks/use-app-selection";
import { useBrewCommands } from "../_hooks/use-brew-commands";
import { useCustomPackages } from "../_hooks/use-custom-packages";
import { BrewPickerContent } from "./brew-picker-content";

interface BrewPickerProps {
  apps: Array<App>;
  categories: Array<{ id: AppCategory; label: string }>;
  kitName?: string;
  kitDescription?: string;
  initialSelectedAppIds?: string[];
  initialCustomPackages?: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }>;
}

export function BrewPicker({
  apps,
  categories,
  kitName,
  kitDescription,
  initialSelectedAppIds = [],
  initialCustomPackages = [],
}: BrewPickerProps) {
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

  const [searchQuery, setSearchQuery] = React.useState("");
  const [copiedText, copy] = useCopyToClipboard();
  const uninstallMode = useBoolean(false);
  const shareDialog = useBoolean(false);

  const selectedCount = selectedApps.size + selectedCustomPackages.size;
  const displayCommand = uninstallMode.value ? uninstallCommand : brewCommand;
  const copied = copiedText === displayCommand;

  const handleCopy = () => {
    if (!displayCommand) return;
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

  return (
    <AppShell
      selectedCount={selectedCount}
      onClearAll={handleClearAll}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      brewCommand={brewCommand}
      uninstallCommand={uninstallCommand}
      copied={copied}
      isUninstallMode={uninstallMode.value}
      onCopy={handleCopy}
      onToggleMode={uninstallMode.toggle}
      onShare={handleShare}
    >
      <BrewPickerContent
        apps={apps}
        categories={categories}
        kitName={kitName}
        kitDescription={kitDescription}
        sharedAppIds={sharedAppIds}
        sharedCustomTokens={sharedCustomTokens}
        selectedApps={selectedApps}
        toggleApp={toggleApp}
        customPackages={customPackages}
        selectedCustomPackages={selectedCustomPackages}
        toggleCustomPackage={toggleCustomPackage}
        removeCustomPackage={removeCustomPackage}
        addCustomPackage={addCustomPackage}
        selectedTokens={selectedTokens}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isShareDialogOpen={shareDialog.value}
        setIsShareDialogOpen={shareDialog.setValue}
      />
    </AppShell>
  );
}
