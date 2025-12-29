"use client";

import Fuse from "fuse.js";
import * as React from "react";
import { APPS } from "@/lib/data/apps";
import type { App, AppCategory } from "@/lib/data/schema";
import { CATEGORIES } from "@/lib/data/schema";
import { SearchResult } from "@/lib/integrations/search";
import { useBrewPickerContext } from "../_hooks/use-brew-picker-context";
import { useSearchQuery } from "../_hooks/use-search-query";
import { AppCard } from "./app-card";
import { AppGridView } from "./app-grid-view";
import { CategoryFilter } from "./category-filter";
import { CategoryGridView } from "./category-grid-view";
import {
  CustomPackageCard,
  CustomPackagesSection,
} from "./custom-package-card";
import { EmptySearchState } from "./empty-search-state";
import { HomebrewSearchDialog } from "./homebrew-search-dialog";
import { ShareDialog } from "./share-dialog";

export function BrewPickerContent() {
  const {
    sharedAppIds,
    sharedCustomTokens,
    selectedApps,
    toggleApp,
    customPackages,
    selectedCustomPackages,
    toggleCustomPackage,
    removeCustomPackage,
    addCustomPackage,
    selectedTokens,
    isShareDialogOpen,
    setIsShareDialogOpen,
    kitName,
    kitDescription,
  } = useBrewPickerContext();

  const { searchQuery } = useSearchQuery();

  const [selectedCategory, setSelectedCategory] = React.useState<
    AppCategory | "all"
  >("all");

  const fuse = React.useMemo(
    () =>
      new Fuse(APPS, {
        keys: ["name", "description", "brewName"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [],
  );

  const filteredApps = React.useMemo(() => {
    let result: Array<App>;

    if (searchQuery.trim()) {
      const results = fuse.search(searchQuery.trim());
      result = results.map((r) => r.item);
    } else {
      result = APPS;
    }

    if (selectedCategory !== "all") {
      result = result.filter((app) => app.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory, fuse]);

  const appsByCategory = React.useMemo(() => {
    const grouped = new Map<AppCategory, Array<App>>();
    for (const category of CATEGORIES) {
      const categoryApps = filteredApps.filter(
        (app) => app.category === category.id,
      );
      if (categoryApps.length > 0) {
        grouped.set(category.id, categoryApps);
      }
    }
    return grouped;
  }, [filteredApps]);

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

  const showCategorySections = selectedCategory === "all";

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

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
                  {sharedAppIds.size + sharedCustomTokens.size} apps
                </span>{" "}
                pre-selected for quick installation
              </div>
            </div>

            {(sharedAppIds.size > 0 || sharedCustomTokens.size > 0) && (
              <div className="mb-12">
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from(sharedAppIds)
                    .map((id) => APPS.find((app) => app.id === id))
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
                categories={CATEGORIES}
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

          <div className="mt-6">
            <HomebrewSearchDialog
              onSelectPackage={handleSelectPackage}
              selectedTokens={selectedTokens}
            />
          </div>
        </div>
      </div>

      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        selectedAppIds={Array.from(selectedApps)}
        customPackageTokens={Array.from(selectedCustomPackages)}
      />
    </>
  );
}
