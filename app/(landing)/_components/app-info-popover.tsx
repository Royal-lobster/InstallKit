"use client";

import { Info } from "@phosphor-icons/react";
import type * as React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { App } from "@/lib/data/schema";
import {
  generateBrewCommand,
  getHomebrewUrl,
} from "@/lib/helpers/brew-commands";
import {
  type FullCatalogInfo,
  useFullCatalogInfo,
} from "../_hooks/use-full-catalog-info";
import { AppIcon } from "./app-icon";

interface AppInfoPopoverProps {
  app: App;
}

function getDescription(
  brewInfo: FullCatalogInfo | undefined,
  fallback: string,
  error: Error | null,
) {
  if (error) return "Could not load Homebrew details";
  const desc = (brewInfo?.description ?? "").trim();
  return desc || fallback || "No description available yet.";
}

export function AppInfoPopover({ app }: AppInfoPopoverProps) {
  const [open, setOpen] = useState(false);

  // Only fetch when popover opens
  const {
    data: brewInfo,
    isLoading,
    error,
  } = useFullCatalogInfo(app.brewName, open);

  const homebrewUrl =
    brewInfo?.url ??
    getHomebrewUrl(app.brewName, app.isCask ? "cask" : "formula");
  const description = getDescription(brewInfo, app.description, error);
  const brewCommand = generateBrewCommand(
    app.brewName,
    brewInfo?.kind || (app.isCask ? "cask" : "formula"),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        openOnHover
        delay={120}
        aria-label={`More about ${app.name}`}
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
            <AppIcon
              iconUrl={app.iconUrl}
              invertInDark={app.invertInDark}
              size="md"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">
                {brewInfo?.name ?? app.name}
              </p>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {brewInfo?.kind ?? "brew"}
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
