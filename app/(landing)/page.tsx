"use client";

import { useQueryState } from "nuqs";
import { useState } from "react";
import type { App, AppCategory } from "@/lib/data/schema";
import { CATEGORIES } from "@/lib/data/schema";
import type { FullCatalogPackage } from "@/lib/helpers/brew-commands";
import type { SearchResult } from "@/lib/integrations/search";
import { AppGrid, AppGridByCategory } from "./_components/app-grid-by-category";
import { Categories } from "./_components/categories";
import { CommandFooter } from "./_components/command-footer";
import { FullCatalogPackagesSection } from "./_components/full-catalog-package";
import { Header } from "./_components/header";
import { KitSection } from "./_components/kit-section";
import {
  FullCatalogSearchSection,
  SearchResultsSection,
} from "./_components/search-results-section";
import { useFilteredApps } from "./_hooks/use-filtered-apps";
import { usePackageSelection } from "./_hooks/use-package-selection";
import { useUrlParams } from "./_hooks/use-url-params";

export default function HomePage() {
  // URL parameters
  const {
    kitName,
    kitDescription,
    initialSelectedAppIds,
    initialFullCatalogPackages,
  } = useUrlParams();

  // Package selection state (apps + full catalog packages)
  const {
    selectedApps,
    toggleApp,
    fullCatalogPackages,
    selectedFullCatalogPackages,
    sharedFullCatalogTokens,
    toggleFullCatalogPackage,
    removeFullCatalogPackage,
    handleSelectPackage,
    selectedCount,
    selectedAppNames,
    selectedTokens,
    brewCommand,
    uninstallCommand,
    clearAll,
  } = usePackageSelection(initialSelectedAppIds, initialFullCatalogPackages);

  // UI state
  const [searchQueryRaw] = useQueryState("search", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const searchQuery = searchQueryRaw ?? "";
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | "all">(
    "all",
  );

  // Filtered apps based on search and category
  const { filteredApps, appsByCategory, hasSearchQuery } = useFilteredApps(
    searchQuery,
    selectedCategory,
  );

  const showCategorySections = selectedCategory === "all" && !hasSearchQuery;

  return (
    <>
      <Header selectedCount={selectedCount} onClearAll={clearAll} />

      <main className="flex-1 pb-24">
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
            <KitSection
              name={kitName}
              description={kitDescription}
              selectedAppIds={initialSelectedAppIds}
              fullCatalogPackages={initialFullCatalogPackages}
              selectedApps={selectedApps}
              selectedTokens={selectedTokens}
              onToggleApp={toggleApp}
              onRemoveFullCatalogPackage={removeFullCatalogPackage}
            />
          )}

          <AppContent
            hasSearchQuery={hasSearchQuery}
            searchQuery={searchQuery}
            showCategorySections={showCategorySections}
            filteredApps={filteredApps}
            appsByCategory={appsByCategory}
            selectedApps={selectedApps}
            selectedTokens={selectedTokens}
            onToggleApp={toggleApp}
            onSelectPackage={handleSelectPackage}
            fullCatalogPackages={fullCatalogPackages}
            selectedFullCatalogPackages={selectedFullCatalogPackages}
            sharedFullCatalogTokens={sharedFullCatalogTokens}
            onToggleFullCatalogPackage={toggleFullCatalogPackage}
            onRemoveFullCatalogPackage={removeFullCatalogPackage}
          />
        </div>
      </main>

      <CommandFooter
        brewCommand={brewCommand}
        uninstallCommand={uninstallCommand}
        selectedCount={selectedCount}
        selectedApps={selectedAppNames}
        fullCatalogPackagesCount={selectedFullCatalogPackages.size}
      />
    </>
  );
}

// --- Content Section Components ---

interface AppContentProps {
  hasSearchQuery: boolean;
  searchQuery: string;
  showCategorySections: boolean;
  filteredApps: App[];
  appsByCategory: Map<AppCategory, App[]>;
  selectedApps: Set<string>;
  selectedTokens: Set<string>;
  onToggleApp: (appId: string) => void;
  onSelectPackage: (pkg: SearchResult) => void;
  fullCatalogPackages: Map<string, FullCatalogPackage>;
  selectedFullCatalogPackages: Set<string>;
  sharedFullCatalogTokens: Set<string>;
  onToggleFullCatalogPackage: (token: string) => void;
  onRemoveFullCatalogPackage: (token: string) => void;
}

function AppContent({
  hasSearchQuery,
  searchQuery,
  showCategorySections,
  filteredApps,
  appsByCategory,
  selectedApps,
  selectedTokens,
  onToggleApp,
  onSelectPackage,
  fullCatalogPackages,
  selectedFullCatalogPackages,
  sharedFullCatalogTokens,
  onToggleFullCatalogPackage,
  onRemoveFullCatalogPackage,
}: AppContentProps) {
  if (hasSearchQuery) {
    return (
      <div className="space-y-8">
        <SearchResultsSection
          searchQuery={searchQuery}
          filteredApps={filteredApps}
          selectedApps={selectedApps}
          selectedTokens={selectedTokens}
          onToggleApp={onToggleApp}
          onSelectPackage={onSelectPackage}
        />
        <FullCatalogPackagesSection
          packages={fullCatalogPackages}
          selectedTokens={selectedFullCatalogPackages}
          sharedTokens={sharedFullCatalogTokens}
          onToggle={onToggleFullCatalogPackage}
          onRemove={onRemoveFullCatalogPackage}
        />
      </div>
    );
  }

  if (showCategorySections) {
    return (
      <div className="space-y-12">
        <AppGridByCategory
          appsByCategory={appsByCategory}
          selectedApps={selectedApps}
          onToggleApp={onToggleApp}
        />
        <FullCatalogPackagesSection
          packages={fullCatalogPackages}
          selectedTokens={selectedFullCatalogPackages}
          sharedTokens={sharedFullCatalogTokens}
          onToggle={onToggleFullCatalogPackage}
          onRemove={onRemoveFullCatalogPackage}
        />
        <FullCatalogSearchSection
          selectedTokens={selectedTokens}
          onSelectPackage={onSelectPackage}
        />
      </div>
    );
  }

  // Single category view
  return (
    <div className="space-y-8">
      <AppGrid
        apps={filteredApps}
        selectedApps={selectedApps}
        onToggleApp={onToggleApp}
      />
      <FullCatalogPackagesSection
        packages={fullCatalogPackages}
        selectedTokens={selectedFullCatalogPackages}
        sharedTokens={sharedFullCatalogTokens}
        onToggle={onToggleFullCatalogPackage}
        onRemove={onRemoveFullCatalogPackage}
      />
      <FullCatalogSearchSection
        selectedTokens={selectedTokens}
        onSelectPackage={onSelectPackage}
      />
    </div>
  );
}
