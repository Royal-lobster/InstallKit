"use client";

import Fuse from "fuse.js";
import * as React from "react";
import { APPS } from "@/lib/data/apps";
import type { App, AppCategory } from "@/lib/schema";
import type { SearchResult } from "../_actions";
import { AppCard } from "./app-card";
import { CatalogueSearchCTA } from "./catalogue-search-cta";
import { CategoryFilter } from "./category-filter";
import { CategorySection } from "./category-section";
import { CommandFooter } from "./command-footer";
import {
  type CustomPackage,
  CustomPackageCard,
  CustomPackagesSection,
} from "./custom-package-card";
import { Header } from "./header";
import { HomebrewSearchDialog } from "./homebrew-search-dialog";
import { ShareDialog } from "./share-dialog";

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

function generateCommandWithCustom(
  appIds: Array<string>,
  customPackages: Map<string, CustomPackage>,
  mode: "install" | "uninstall",
): string {
  if (appIds.length === 0 && customPackages.size === 0) return "";

  const apps = appIds
    .map((id) => APPS.find((app) => app.id === id))
    .filter((app): app is App => app !== undefined);

  // Collect all casks and formulae from both built-in apps and custom packages
  const allCasks: string[] = [];
  const allFormulae: string[] = [];

  // Add built-in apps
  for (const app of apps) {
    if (app.isCask) {
      allCasks.push(app.brewName);
    } else {
      allFormulae.push(app.brewName);
    }
  }

  // Add custom packages
  for (const pkg of customPackages.values()) {
    if (pkg.type === "cask") {
      allCasks.push(pkg.token);
    } else {
      allFormulae.push(pkg.token);
    }
  }

  const commands: string[] = [];
  const verb = mode === "install" ? "install" : "uninstall";

  if (allCasks.length > 0) {
    commands.push(`brew ${verb} --cask ${allCasks.join(" ")}`);
  }

  if (allFormulae.length > 0) {
    commands.push(`brew ${verb} ${allFormulae.join(" ")}`);
  }

  return commands.join(" && ");
}

export function BrewPicker({
  apps,
  categories,
  kitName,
  kitDescription,
  initialSelectedAppIds = [],
  initialCustomPackages = [],
}: BrewPickerProps) {
  // Track apps that came from the share link
  const sharedAppIds = React.useMemo(
    () => new Set(initialSelectedAppIds),
    [initialSelectedAppIds],
  );
  const sharedCustomTokens = React.useMemo(
    () => new Set(initialCustomPackages.map((pkg) => pkg.token)),
    [initialCustomPackages],
  );

  const [selectedApps, setSelectedApps] = React.useState<Set<string>>(
    new Set(initialSelectedAppIds),
  );
  const [customPackages, setCustomPackages] = React.useState<
    Map<string, CustomPackage>
  >(
    new Map(
      initialCustomPackages.map((pkg) => [
        pkg.token,
        { token: pkg.token, name: pkg.name, type: pkg.type },
      ]),
    ),
  );
  const [selectedCustomPackages, setSelectedCustomPackages] = React.useState<
    Set<string>
  >(new Set(initialCustomPackages.map((pkg) => pkg.token)));
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

  const selectedCustomPackagesMap = React.useMemo(() => {
    const map = new Map<string, CustomPackage>();
    for (const token of selectedCustomPackages) {
      const pkg = customPackages.get(token);
      if (pkg) {
        map.set(token, pkg);
      }
    }
    return map;
  }, [selectedCustomPackages, customPackages]);

  const brewCommand = generateCommandWithCustom(
    Array.from(selectedApps),
    selectedCustomPackagesMap,
    "install",
  );
  const uninstallCommand = generateCommandWithCustom(
    Array.from(selectedApps),
    selectedCustomPackagesMap,
    "uninstall",
  );

  const selectedTokens = React.useMemo(() => {
    const tokens = new Set<string>();
    for (const appId of selectedApps) {
      const app = APPS.find((a) => a.id === appId);
      if (app) {
        tokens.add(app.brewName);
      }
    }
    for (const token of selectedCustomPackages) {
      tokens.add(token);
    }
    return tokens;
  }, [selectedApps, selectedCustomPackages]);

  const handleToggle = (appId: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  const handleToggleCustomPackage = React.useCallback((token: string) => {
    setSelectedCustomPackages((prev) => {
      const next = new Set(prev);
      if (next.has(token)) {
        next.delete(token);
      } else {
        next.add(token);
      }
      return next;
    });
  }, []);

  const handleSelectPackage = React.useCallback((pkg: SearchResult) => {
    const existingApp = APPS.find((app) => app.brewName === pkg.token);
    if (existingApp) {
      setSelectedApps((prev) => {
        const next = new Set(prev);
        if (next.has(existingApp.id)) {
          next.delete(existingApp.id);
        } else {
          next.add(existingApp.id);
        }
        return next;
      });
      return;
    }

    // For custom packages, add to the map if not present
    setCustomPackages((prev) => {
      const next = new Map(prev);
      if (!next.has(pkg.token)) {
        next.set(pkg.token, {
          token: pkg.token,
          name: pkg.name,
          type: pkg.type,
        });
      }
      return next;
    });

    // Toggle selection state
    setSelectedCustomPackages((prev) => {
      const next = new Set(prev);
      if (next.has(pkg.token)) {
        next.delete(pkg.token);
      } else {
        next.add(pkg.token);
      }
      return next;
    });
  }, []);

  const handleCopy = async () => {
    const command = isUninstallMode ? uninstallCommand : brewCommand;
    if (!command) return;
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearAll = () => {
    setSelectedApps(new Set());
    setSelectedCustomPackages(new Set());
  };

  const handleToggleMode = () => {
    setIsUninstallMode((prev) => !prev);
  };

  const handleRemoveCustomPackage = React.useCallback(
    (token: string) => {
      // If it's from the share link, just deselect it
      if (sharedCustomTokens.has(token)) {
        setSelectedCustomPackages((prev) => {
          const next = new Set(prev);
          next.delete(token);
          return next;
        });
      } else {
        // Otherwise, remove it completely
        setCustomPackages((prev) => {
          const next = new Map(prev);
          next.delete(token);
          return next;
        });
        setSelectedCustomPackages((prev) => {
          const next = new Set(prev);
          next.delete(token);
          return next;
        });
      }
    },
    [sharedCustomTokens],
  );

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
                          onToggle={handleToggle}
                        />
                      ))}
                    {Array.from(sharedCustomTokens)
                      .map((token) => customPackages.get(token))
                      .filter((pkg): pkg is CustomPackage => pkg !== undefined)
                      .map((pkg) => (
                        <CustomPackageCard
                          key={pkg.token}
                          pkg={pkg}
                          onRemove={handleRemoveCustomPackage}
                          isSelected={selectedCustomPackages.has(pkg.token)}
                          onToggle={handleToggleCustomPackage}
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
                <div className="space-y-8">
                  {Array.from(appsByCategory.entries()).map(
                    ([categoryId, categoryApps]) => (
                      <CategorySection
                        key={categoryId}
                        categoryId={categoryId}
                        apps={categoryApps}
                        categories={categories}
                        selectedApps={selectedApps}
                        onToggle={handleToggle}
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      isSelected={selectedApps.has(app.id)}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="py-16 text-center font-mono text-sm text-muted-foreground">
                No apps found for &quot;{searchQuery}&quot;
              </div>
            )}

            {customPackages.size > sharedCustomTokens.size && (
              <CustomPackagesSection
                packages={customPackages}
                selectedTokens={selectedCustomPackages}
                onRemove={handleRemoveCustomPackage}
                fromShareLink={false}
                sharedTokens={sharedCustomTokens}
                onToggle={handleToggleCustomPackage}
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
