"use client";

import {
  ArrowSquareOut,
  Globe,
  Info,
  PackageIcon,
} from "@phosphor-icons/react";
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
        className="w-80 overflow-hidden p-0 pointer-events-auto"
      >
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <PackageIcon className="size-5" weight="duotone" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold leading-none">
                  {displayName}
                </p>
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] uppercase tracking-wider"
                >
                  {brewInfo?.kind ?? pkg.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                {description}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Badge
                  variant="outline"
                  className="max-w-full truncate font-mono text-[10px]"
                >
                  {brewCommand}
                </Badge>
                {brewInfo?.version && (
                  <Badge
                    variant="outline"
                    className="max-w-full truncate text-[10px]"
                  >
                    v{brewInfo.version}
                  </Badge>
                )}
              </div>
              {isLoading && (
                <p className="text-[10px] text-muted-foreground animate-pulse">
                  Loading Homebrew data...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t bg-muted/40 p-3">
          <a
            href={homebrewUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowSquareOut className="size-3.5" />
            Homebrew
          </a>
          {brewInfo?.homepage && (
            <a
              href={brewInfo.homepage}
              target="_blank"
              rel="noreferrer"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Globe className="size-3.5" />
              Website
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
