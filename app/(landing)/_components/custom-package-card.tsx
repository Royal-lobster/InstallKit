/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Fine here */

"use client";

import { Package, XIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SelectionCheckbox } from "./selection-checkbox";

export interface CustomPackage {
  token: string;
  name: string;
  type: "cask" | "formula";
}

interface CustomPackageCardProps {
  pkg: CustomPackage;
  onRemove: (token: string) => void;
  isSelected?: boolean;
  onToggle?: (token: string) => void;
  showCheckbox?: boolean;
}

export function CustomPackageCard({
  pkg,
  onRemove,
  isSelected = true,
  onToggle,
  showCheckbox = false,
}: CustomPackageCardProps) {
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
        onToggle && "cursor-pointer hover:bg-muted/50",
        isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-card",
        !showCheckbox &&
          isRemoving &&
          "scale-95 opacity-0 transition-all duration-200",
      )}
    >
      <div className="flex size-5 shrink-0 items-center justify-center">
        <Package className="size-4 text-muted-foreground" weight="duotone" />
      </div>
      <span className="min-w-0 flex-1 truncate font-mono text-xs">
        {pkg.name}
      </span>
      <div className="flex items-center gap-2">
        {showCheckbox ? (
          <SelectionCheckbox
            isSelected={isSelected}
            onToggle={onToggle ? () => onToggle(pkg.token) : undefined}
          />
        ) : (
          <>
            <Badge
              variant="secondary"
              className="shrink-0 font-mono text-[10px] uppercase"
            >
              {pkg.type}
            </Badge>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={handleRemove}
            >
              <XIcon className="size-3.5" weight="bold" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface CustomPackagesSectionProps {
  packages: Map<string, CustomPackage>;
  selectedTokens: Set<string>;
  onRemove: (token: string) => void;
  fromShareLink?: boolean;
  sharedTokens?: Set<string>;
  onToggle?: (token: string) => void;
  showCheckbox?: boolean;
}

export function CustomPackagesSection({
  packages,
  selectedTokens,
  onRemove,
  fromShareLink = false,
  sharedTokens = new Set(),
  onToggle,
  showCheckbox = false,
}: CustomPackagesSectionProps) {
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
          From Homebrew Search
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground/60">
          ({displayPackages.length})
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayPackages.map((pkg) => (
          <CustomPackageCard
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
