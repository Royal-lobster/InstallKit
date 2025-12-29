"use client";

import { Info, PackageIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  generateBrewCommand,
  getHomebrewUrl,
} from "@/lib/helpers/brew-commands";
import {
  type FullCatalogInfo,
  useFullCatalogInfo,
} from "../_hooks/use-full-catalog-info";

interface FullCatalogInfoPopoverProps {
  package: {
    token: string;
    name: string;
    type: "cask" | "formula";
  };
}

function getDescription(
  brewInfo: FullCatalogInfo | undefined,
  error: Error | null,
) {
  if (error) return "Could not load Homebrew details";
  const desc = (brewInfo?.description ?? "").trim();
  return desc || "No description available yet.";
}

export function FullCatalogInfoPopover({
  package: pkg,
}: FullCatalogInfoPopoverProps) {
  const [open, setOpen] = useState(false);

  // Only fetch when popover opens
  const {
    data: brewInfo,
    isLoading,
    error,
  } = useFullCatalogInfo(pkg.token, open);

  const homebrewUrl = brewInfo?.url ?? getHomebrewUrl(pkg.token, pkg.type);
  const description = getDescription(brewInfo, error);
  const brewCommand = generateBrewCommand(
    pkg.token,
    brewInfo?.kind || pkg.type,
  );
  const displayName = brewInfo?.name || pkg.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        openOnHover
        delay={120}
        aria-label={`More about ${displayName}`}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full border border-transparent hover:border-muted-foreground/60"
          />
        }
      >
        <Info className="size-3.5" weight="bold" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={12}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="pointer-events-auto"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border bg-card">
            <PackageIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {brewInfo?.kind ?? pkg.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="max-w-full truncate font-mono"
              >
                {brewCommand}
              </Badge>
              {brewInfo?.version && (
                <Badge variant="outline" className="max-w-full truncate">
                  v{brewInfo.version}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={homebrewUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Homebrew page
              </a>
              {brewInfo?.homepage && (
                <a
                  href={brewInfo.homepage}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="text-[11px] font-medium text-muted-foreground hover:underline"
                >
                  Homepage
                </a>
              )}
            </div>
            {isLoading && (
              <p className="text-[11px] text-muted-foreground">
                Loading Homebrew data...
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
