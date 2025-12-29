/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Fine here */

"use client";

import { PackageIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FullCatalogInfoPopover } from "./full-catalog-info-popover";
import { SelectionCheckbox } from "./selection-checkbox";

interface FullCatalogSelectionCardProps {
  package: {
    token: string;
    name: string;
    type: "cask" | "formula";
  };
  isSelected: boolean;
  onToggle: (token: string) => void;
}

export function FullCatalogSelectionCard({
  package: pkg,
  isSelected,
  onToggle,
}: FullCatalogSelectionCardProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Fine here
    <div
      onClick={(e) => {
        // Prevent toggle if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
          return;
        }
        onToggle(pkg.token);
      }}
      className={cn(
        "group flex cursor-pointer select-none items-center gap-2.5 border px-2.5 py-2 text-left transition-colors",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="flex size-5 shrink-0 items-center justify-center">
        <PackageIcon className="size-4 text-muted-foreground" />
      </div>
      <span className="min-w-0 flex-1 truncate font-mono text-xs">
        {pkg.token}
      </span>
      <div className="flex items-center gap-2">
        <FullCatalogInfoPopover package={pkg} />
        <SelectionCheckbox
          isSelected={isSelected}
          onToggle={() => onToggle(pkg.token)}
          appId={pkg.token}
        />
      </div>
    </div>
  );
}
