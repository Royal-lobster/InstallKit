/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Fine here */

"use client";

import { Package, XIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SelectionCheckbox } from "./selection-checkbox";

export interface FullCatalogPackageType {
  token: string;
  name: string;
  type: "cask" | "formula";
}

interface FullCatalogPackageProps {
  pkg: FullCatalogPackageType;
  onRemove: (token: string) => void;
  isSelected?: boolean;
  onToggle?: (token: string) => void;
  showCheckbox?: boolean;
}

export function FullCatalogPackage({
  pkg,
  onRemove,
  isSelected = true,
  onToggle,
  showCheckbox = false,
}: FullCatalogPackageProps) {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemove = React.useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(pkg.token);
    }, 200);
  }, [onRemove, pkg.token]);

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      // Prevent toggle if clicking on interactive elements
      if ((e.target as HTMLElement).closest('button, [role="button"]')) {
        return;
      }
      if (onToggle) {
        onToggle(pkg.token);
      }
    },
    [onToggle, pkg.token],
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Fine here
    <div
      onClick={handleClick}
      className={cn(
        "group flex select-none items-center gap-2.5 border px-2.5 py-2 text-left transition-colors",
        "cursor-pointer hover:border-muted-foreground/40",
        isSelected
          ? "bg-accent/50 border-accent-foreground/20"
          : "bg-background hover:bg-accent/20",
        isRemoving && "opacity-50",
        onToggle && "cursor-pointer",
      )}
    >
      {showCheckbox && onToggle && (
        <SelectionCheckbox isSelected={isSelected} onToggle={onToggle} />
      )}

      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
        <Package size={16} className="text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{pkg.name}</span>
          <Badge
            variant="outline"
            className="font-mono text-[10px] font-medium"
          >
            {pkg.type}
          </Badge>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {pkg.token}
        </div>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        className="h-6 w-6 p-0 opacity-60 hover:opacity-100 focus:opacity-100"
      >
        <XIcon size={12} />
        <span className="sr-only">Remove {pkg.name}</span>
      </Button>
    </div>
  );
}

interface FullCatalogPackagesSectionProps {
  packages: Map<string, FullCatalogPackageType>;
  selectedTokens: Set<string>;
  onRemove: (token: string) => void;
  fromShareLink?: boolean;
  sharedTokens?: Set<string>;
  onToggle?: (token: string) => void;
  showCheckbox?: boolean;
}

export function FullCatalogPackagesSection({
  packages,
  selectedTokens,
  onRemove,
  fromShareLink = false,
  sharedTokens = new Set(),
  onToggle,
  showCheckbox = false,
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
          <FullCatalogPackage
            key={pkg.token}
            pkg={pkg}
            onRemove={onRemove}
            isSelected={selectedTokens.has(pkg.token)}
            onToggle={onToggle}
            showCheckbox={showCheckbox}
          />
        ))}
      </div>
    </section>
  );
}
