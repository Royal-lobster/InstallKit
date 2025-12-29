"use client";

import { AppSelectionCard } from "./app-selection-card";

export interface FullCatalogPackageType {
  token: string;
  name: string;
  type: "cask" | "formula";
}

interface FullCatalogPackagesSectionProps {
  packages: Map<string, FullCatalogPackageType>;
  selectedTokens: Set<string>;
  onRemove: (token: string) => void;
  fromShareLink?: boolean;
  sharedTokens?: Set<string>;
  onToggle?: (token: string) => void;
}

export function FullCatalogPackagesSection({
  packages,
  selectedTokens,
  onRemove,
  fromShareLink = false,
  sharedTokens = new Set(),
  onToggle,
}: FullCatalogPackagesSectionProps) {
  // Filter packages based on whether we're showing shared or non-shared packages
  const displayPackages = Array.from(packages.values()).filter((pkg) =>
    fromShareLink ? sharedTokens.has(pkg.token) : !sharedTokens.has(pkg.token),
  );

  if (displayPackages.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
          From Full Catalog
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground/60">
          ({displayPackages.length})
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayPackages.map((pkg) => (
          <AppSelectionCard
            key={pkg.token}
            variant="package"
            id={pkg.token}
            name={pkg.name}
            packageType={pkg.type}
            isSelected={selectedTokens.has(pkg.token)}
            onToggle={onToggle ?? (() => {})}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
