"use client";

import { useQueryState } from "nuqs";
import { CATEGORIES } from "@/lib/data/schema";
import { CategoryProvider, useCategory } from "../_hooks/use-category";
import { useFilteredApps } from "../_hooks/use-filtered-apps";
import { usePackageActions } from "../_hooks/use-package-actions";
import { usePackageState } from "../_hooks/use-package-state";
import { usePackageStore } from "../_hooks/use-package-store";
import { useUrlInitialization } from "../_hooks/use-url-initialization";
import { AppGrid, AppGridByCategory } from "./app-grid-by-category";
import { Categories } from "./categories";
import { CommandFooter } from "./command-footer";
import { FullCatalogPackagesSection } from "./full-catalog-package";
import { FullCatalogSearch } from "./full-catalog-search";
import { Header } from "./header";
import { KitSection } from "./kit-section";
import { SearchResultsSection } from "./search-results-section";

interface HomePageClientProps {
  kitName: string | undefined;
  kitDescription: string | undefined;
  initialSelectedAppIds: string[];
  initialFullCatalogPackages: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }>;
}

export function HomePageClient({
  kitName,
  kitDescription,
  initialSelectedAppIds,
  initialFullCatalogPackages,
}: HomePageClientProps) {
  // URL initialization only
  useUrlInitialization(initialSelectedAppIds, initialFullCatalogPackages);

  return (
    <CategoryProvider>
      <Header />

      <main className="flex-1 pb-24">
        <Categories categories={CATEGORIES} />

        <div className="mx-auto max-w-6xl px-4 py-6">
          {kitName && (
            <KitSection
              name={kitName}
              description={kitDescription}
              selectedAppIds={initialSelectedAppIds}
              fullCatalogPackages={initialFullCatalogPackages}
            />
          )}

          <MainContent />
        </div>
      </main>

      <CommandFooter />
    </CategoryProvider>
  );
}

function MainContent() {
  // Get search query from URL
  const [searchQueryRaw] = useQueryState("search", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const searchQuery = searchQueryRaw ?? "";

  // Get category selection from context
  const { selectedCategory } = useCategory();

  // Package state
  const {
    selectedApps,
    fullCatalogPackages,
    selectedFullCatalogPackages,
    selectedTokens,
  } = usePackageState();

  // Get shared tokens from store
  const sharedFullCatalogTokens = usePackageStore(
    (state) => state.sharedFullCatalogTokens,
  );

  // Package actions
  const {
    toggleApp,
    toggleFullCatalogPackage,
    removeFullCatalogPackage,
    handleSelectPackage,
  } = usePackageActions();

  // Filtered apps based on search and category
  const { filteredApps, appsByCategory, hasSearchQuery } = useFilteredApps(
    searchQuery,
    selectedCategory,
  );

  const showCategorySections = selectedCategory === "all" && !hasSearchQuery;

  if (hasSearchQuery) {
    return (
      <div className="space-y-8">
        <SearchResultsSection
          searchQuery={searchQuery}
          filteredApps={filteredApps}
          selectedApps={selectedApps}
          selectedTokens={selectedTokens}
          onToggleApp={toggleApp}
          onSelectPackage={handleSelectPackage}
        />
        <FullCatalogPackagesSection
          packages={fullCatalogPackages}
          selectedTokens={selectedFullCatalogPackages}
          sharedTokens={sharedFullCatalogTokens}
          onToggle={toggleFullCatalogPackage}
          onRemove={removeFullCatalogPackage}
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
          onToggleApp={toggleApp}
        />
        <FullCatalogPackagesSection
          packages={fullCatalogPackages}
          selectedTokens={selectedFullCatalogPackages}
          sharedTokens={sharedFullCatalogTokens}
          onToggle={toggleFullCatalogPackage}
          onRemove={removeFullCatalogPackage}
        />
        <FullCatalogSearch
          onSelectPackage={handleSelectPackage}
          selectedTokens={selectedTokens}
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
        onToggleApp={toggleApp}
      />
      <FullCatalogPackagesSection
        packages={fullCatalogPackages}
        selectedTokens={selectedFullCatalogPackages}
        sharedTokens={sharedFullCatalogTokens}
        onToggle={toggleFullCatalogPackage}
        onRemove={removeFullCatalogPackage}
      />
      <FullCatalogSearch
        onSelectPackage={handleSelectPackage}
        selectedTokens={selectedTokens}
      />
    </div>
  );
}
