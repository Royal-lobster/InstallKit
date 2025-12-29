"use client";

import Fuse from "fuse.js";
import * as React from "react";
import { APPS } from "@/lib/data/apps";
import type { App, AppCategory } from "@/lib/data/schema";
import { CATEGORIES } from "@/lib/data/schema";
import type { SearchResult } from "@/lib/integrations/search";
import { useInstallKit } from "../_hooks/use-installkit";
import { useSearchQuery } from "../_hooks/use-search-query";
import { AppCard } from "./app-card";
import { AppGrid } from "./app-grid";
import { Categories } from "./categories";
import {
  FullCatalogPackage,
  FullCatalogPackagesSection,
} from "./full-catalog-package";
import { FullCatalogSearch } from "./full-catalog-search";
import { ShareDialog } from "./share-dialog";

export function AppSelector() {
  const {
    sharedAppIds,
    sharedCustomTokens: sharedFullCatalogTokens,
    selectedApps,
    toggleApp,
    fullCatalogPackages,
    selectedFullCatalogPackages,
    toggleFullCatalogPackage,
    removeFullCatalogPackage,
    addFullCatalogPackage,
    selectedTokens,
    isShareDialogOpen,
    setIsShareDialogOpen,
    kitName,
    kitDescription,
  } = useInstallKit();

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

      addFullCatalogPackage({
        token: pkg.token,
        name: pkg.name,
        type: pkg.type,
      });

      toggleFullCatalogPackage(pkg.token);
    },
    [toggleApp, addFullCatalogPackage, toggleFullCatalogPackage],
  );

  const showCategorySections = selectedCategory === "all";
  const hasEmptySearch = filteredApps.length === 0 && searchQuery.trim();

  return (
    <>
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <Categories
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
                  {sharedAppIds.size + sharedFullCatalogTokens.size} apps
                </span>{" "}
                pre-selected for quick installation
              </div>
            </div>

            {(sharedAppIds.size > 0 || sharedFullCatalogTokens.size > 0) && (
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
                  {Array.from(sharedFullCatalogTokens)
                    .map((token) => fullCatalogPackages.get(token))
                    .filter((pkg) => pkg !== undefined)
                    .map((pkg) => (
                      <FullCatalogPackage
                        key={pkg.token}
                        pkg={pkg}
                        onRemove={removeFullCatalogPackage}
                        isSelected={selectedFullCatalogPackages.has(pkg.token)}
                        onToggle={toggleFullCatalogPackage}
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
          {hasEmptySearch ? (
            <div className="py-12 text-center">
              <div className="mx-auto max-w-md">
                <div className="mb-4 text-muted-foreground">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h.01M12 12h.01M15 12h.01M12 3c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">No apps found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No apps matched your search for "{searchQuery}". Try a
                  different search term or browse our categories.
                </p>
              </div>
            </div>
          ) : (
            <>
              {showCategorySections ? (
                <Categories
                  categories={CATEGORIES}
                  appsByCategory={appsByCategory}
                  selectedApps={selectedApps}
                  onToggle={toggleApp}
                  showGrid={true}
                />
              ) : (
                <AppGrid
                  apps={filteredApps}
                  selectedApps={selectedApps}
                  onToggle={toggleApp}
                />
              )}
            </>
          )}

          {fullCatalogPackages.size > sharedFullCatalogTokens.size && (
            <FullCatalogPackagesSection
              packages={fullCatalogPackages}
              selectedTokens={selectedFullCatalogPackages}
              onRemove={removeFullCatalogPackage}
              fromShareLink={false}
              sharedTokens={sharedFullCatalogTokens}
              onToggle={toggleFullCatalogPackage}
            />
          )}

          <div className="mt-6">
            <FullCatalogSearch
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
        fullCatalogPackageTokens={Array.from(selectedFullCatalogPackages)}
      />
    </>
  );
}
