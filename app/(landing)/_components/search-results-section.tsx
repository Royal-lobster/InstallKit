import type { App } from "@/lib/data/schema";
import type { SearchResult } from "@/lib/integrations/search";
import { AppGrid } from "./app-grid-by-category";
import { FullCatalogSearch } from "./full-catalog-search";

interface SearchResultsSectionProps {
  searchQuery: string;
  filteredApps: App[];
  selectedApps: Set<string>;
  selectedTokens: Set<string>;
  onToggleApp: (appId: string) => void;
  onSelectPackage: (pkg: SearchResult) => void;
}

export function SearchResultsSection({
  searchQuery,
  filteredApps,
  selectedApps,
  selectedTokens,
  onToggleApp,
  onSelectPackage,
}: SearchResultsSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Search Results for "{searchQuery}"
        </h2>
      </div>

      {filteredApps.length > 0 ? (
        <AppGrid
          apps={filteredApps}
          selectedApps={selectedApps}
          onToggleApp={onToggleApp}
        />
      ) : (
        <EmptySearchResults query={searchQuery} />
      )}

      <FullCatalogSearch
        onSelectPackage={onSelectPackage}
        selectedTokens={selectedTokens}
      />
    </div>
  );
}

interface EmptySearchResultsProps {
  query: string;
}

function EmptySearchResults({ query }: EmptySearchResultsProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground">No apps found matching "{query}"</p>
    </div>
  );
}
