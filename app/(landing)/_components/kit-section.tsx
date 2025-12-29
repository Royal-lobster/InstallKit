"use client";

import { CURATED_APPS } from "@/lib/data/curated-catalogue";
import { AppSelectionCard } from "./app-selection-card";
import { FullCatalogSelectionCard } from "./full-catalog-selection-card";

interface KitSectionProps {
  name: string;
  description?: string;
  selectedAppIds: string[];
  fullCatalogPackages: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }>;
  selectedApps: Set<string>;
  selectedTokens: Set<string>;
  onToggleApp: (appId: string) => void;
  onToggleFullCatalogPackage: (token: string) => void;
}

export function KitSection({
  name,
  description,
  selectedAppIds,
  fullCatalogPackages,
  selectedApps,
  selectedTokens,
  onToggleApp,
  onToggleFullCatalogPackage,
}: KitSectionProps) {
  const preselectedApps = CURATED_APPS.filter((app) =>
    selectedAppIds.includes(app.id),
  );
  const totalCount = preselectedApps.length + fullCatalogPackages.length;

  return (
    <div className="mb-12">
      {/* Kit Header */}
      <div className="pb-8 pt-12">
        <h1 className="text-center text-5xl font-bold tracking-tight sm:text-6xl">
          {name}
        </h1>
        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        )}
        <p className="mt-4 text-center text-muted-foreground">
          <span className="font-bold text-white">{totalCount} apps </span>
          pre-selected for quick installation
        </p>
      </div>

      {/* Kit Showcase */}
      {totalCount > 0 && (
        <div className="mt-8">
          <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {preselectedApps.map((app) => {
              const isSelected = selectedApps.has(app.id);
              return (
                <AppSelectionCard
                  key={app.id}
                  variant="app"
                  id={app.id}
                  name={app.name}
                  app={app}
                  isSelected={isSelected}
                  onToggle={onToggleApp}
                  showInfoPopover={true}
                />
              );
            })}

            {fullCatalogPackages.map((pkg) => {
              const isSelected = selectedTokens.has(pkg.token);
              return (
                <FullCatalogSelectionCard
                  key={pkg.token}
                  package={pkg}
                  isSelected={isSelected}
                  onToggle={onToggleFullCatalogPackage}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Browse all apps divider */}
      <div className="my-12 flex items-center gap-4">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-sm text-muted-foreground">Browse all apps</span>
        <div className="h-px flex-1 bg-border/40" />
      </div>
    </div>
  );
}
