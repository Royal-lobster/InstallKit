"use client";

import * as React from "react";
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
  const [copied, setCopied] = React.useState(false);
  const [isUninstallMode, setIsUninstallMode] = React.useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);

  const selectedCount = selectedApps.size + selectedCustomPackages.size;

  const handleCopy = async () => {
    const command = isUninstallMode ? uninstallCommand : brewCommand;
    if (!command) return;
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleToggleMode = () => {
    setIsUninstallMode((prev) => !prev);
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
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
      isUninstallMode={isUninstallMode}
      onCopy={handleCopy}
      onToggleMode={handleToggleMode}
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
        isSearchDialogOpen={isSearchDialogOpen}
        setIsSearchDialogOpen={setIsSearchDialogOpen}
        isShareDialogOpen={isShareDialogOpen}
        setIsShareDialogOpen={setIsShareDialogOpen}
      />
    </AppShell>
  );
}
