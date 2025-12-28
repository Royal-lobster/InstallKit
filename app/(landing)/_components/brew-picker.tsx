"use client";

import Fuse from "fuse.js";
import * as React from "react";
import { useAppSelection } from "../_hooks/use-app-selection";
import { useBrewCommands } from "../_hooks/use-brew-commands";
import { useCustomPackages } from "../_hooks/use-custom-packages";
import type { App, AppCategory } from "@/lib/schema";
import type { SearchResult } from "../_actions";
import { AppCard } from "./app-card";
import { AppGridView } from "./app-grid-view";
import { CatalogueSearchCTA } from "./catalogue-search-cta";
import { CategoryFilter } from "./category-filter";
import { CategoryGridView } from "./category-grid-view";
import { CommandFooter } from "./command-footer";
import {
  CustomPackageCard,
  CustomPackagesSection,
} from "./custom-package-card";
import { EmptySearchState } from "./empty-search-state";
import { Header } from "./header";
import { HomebrewSearchDialog } from "./homebrew-search-dialog";
import { ShareDialog } from "./share-dialog";
import { APPS } from "@/lib/data/apps";

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

  const [selectedCategory, setSelectedCategory] = React.useState<
    AppCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [isUninstallMode, setIsUninstallMode] = React.useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);

  const fuse = React.useMemo(
    () =>
      new Fuse(apps, {
        keys: ["name", "description", "brewName"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [apps],
  );

  const filteredApps = React.useMemo(() => {
    let result: Array<App>;

    if (searchQuery.trim()) {
      const results = fuse.search(searchQuery.trim());
      result = results.map((r) => r.item);
    } else {
      result = apps;
    }

    if (selectedCategory !== "all") {
      result = result.filter((app) => app.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory, fuse, apps]);

  const appsByCategory = React.useMemo(() => {
    const grouped = new Map<AppCategory, Array<App>>();
    for (const category of categories) {
      const categoryApps = filteredApps.filter(
        (app) => app.category === category.id,
      );
      if (categoryApps.length > 0) {
        grouped.set(category.id, categoryApps);
      }
    }
    return grouped;
  }, [filteredApps, categories]);

  const selectedCount = selectedApps.size + selectedCustomPackages.size;

  const handleSelectPackage = React.useCallback(
    (pkg: SearchResult) => {
      const existingApp = APPS.find((app) => app.brewName === pkg.token);
      if (existingApp) {
        toggleApp(existingApp.id);
        return;
      }

      addCustomPackage({
        token: pkg.token,
        name: pkg.name,
        type: pkg.type,
      });

      toggleCustomPackage(pkg.token);
    },
    [toggleApp, addCustomPackage, toggleCustomPackage],
  );

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

  const showCategorySections = selectedCategory === "all";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <Header
          selectedCount={selectedCount}
          onClearAll={handleClearAll}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-2">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 pb-24">
        <div className="mx-auto max-w-6xl px-4 py-4">
          {kitName && (
            <>
              <div className="mb-12 border-b border-border/40 pb-8 pt-12">
                <h1 className="text-center text-5xl font-bold tracking-tight sm:text-6xl">
                  {kitName}
                </h1>
                {kitDescription && (
                  <p className="mx-auto mt-3 max-w-2xl text-center text-base text-muted-foreground">
                    {kitDescription}
                  </p>
                )}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {initialSelectedAppIds.length +
                      initialCustomPackages.length}{" "}
                    apps
                  </span>{" "}
                  pre-selected for quick installation
                </div>
              </div>

              {(sharedAppIds.size > 0 || sharedCustomTokens.size > 0) && (
                <div className="mb-12">
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from(sharedAppIds)
                      .map((id) => apps.find((app) => app.id === id))
                      .filter((app): app is App => app !== undefined)
                      .map((app) => (
                        <AppCard
                          key={app.id}
                          app={app}
                          isSelected={selectedApps.has(app.id)}
                          onToggle={toggleApp}
                        />
                      ))}
                    {Array.from(sharedCustomTokens)
                      .map((token) => customPackages.get(token))
                      .filter((pkg) => pkg !== undefined)
                      .map((pkg) => (
                        <CustomPackageCard
                          key={pkg.token}
                          pkg={pkg}
                          onRemove={removeCustomPackage}
                          isSelected={selectedCustomPackages.has(pkg.token)}
                          onToggle={toggleCustomPackage}
                          showCheckbox={true}
                        />
                      ))}
                  </div>
                </div>
              )}

              <div className="my-12 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Browse all apps</span>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <div className="mt-2">
            {filteredApps.length > 0 ? (
              showCategorySections ? (
                <CategoryGridView
                  appsByCategory={appsByCategory}
                  categories={categories}
                  selectedApps={selectedApps}
                  onToggle={toggleApp}
                />
              ) : (
                <AppGridView
                  apps={filteredApps}
                  selectedApps={selectedApps}
                  onToggle={toggleApp}
                />
              )
            ) : (
              <EmptySearchState query={searchQuery} />
            )}

            {customPackages.size > sharedCustomTokens.size && (
              <CustomPackagesSection
                packages={customPackages}
                selectedTokens={selectedCustomPackages}
                onRemove={removeCustomPackage}
                fromShareLink={false}
                sharedTokens={sharedCustomTokens}
                onToggle={toggleCustomPackage}
              />
            )}

            <CatalogueSearchCTA
              onOpenSearch={() => setIsSearchDialogOpen(true)}
            />
          </div>
        </div>
      </main>

      <CommandFooter
        brewCommand={brewCommand}
        uninstallCommand={uninstallCommand}
        selectedCount={selectedCount}
        copied={copied}
        isUninstallMode={isUninstallMode}
        onCopy={handleCopy}
        onToggleMode={handleToggleMode}
        onShare={handleShare}
      />

      <HomebrewSearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onSelectPackage={handleSelectPackage}
        selectedTokens={selectedTokens}
      />

      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        selectedAppIds={Array.from(selectedApps)}
        customPackageTokens={Array.from(selectedCustomPackages)}
      />
    </div>
  );
}
