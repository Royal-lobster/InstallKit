/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Fine here */

"use client";

import { Package, XIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { App } from "@/lib/data/schema";
import { cn } from "@/lib/utils";
import { AppIcon } from "./app-icon";
import { AppInfoPopover } from "./app-info-popover";
import { SelectionCheckbox } from "./selection-checkbox";

interface BaseCardProps {
  id: string;
  name: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

interface AppCardProps extends BaseCardProps {
  variant?: "app";
  app: App;
  showInfoPopover?: boolean;
  onRemove?: never;
}

interface PackageCardProps extends BaseCardProps {
  variant: "package";
  packageType: "cask" | "formula";
  onRemove: (id: string) => void;
  app?: never;
  showInfoPopover?: never;
}

type AppSelectionCardProps = AppCardProps | PackageCardProps;

export function AppSelectionCard(props: AppSelectionCardProps) {
  const { id, name, isSelected, onToggle, variant = "app" } = props;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent toggle if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      return;
    }
    onToggle(id);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Fine here
    <div
      onClick={handleClick}
      className={cn(
        "group flex cursor-pointer select-none items-center gap-2.5 border px-2.5 py-2 text-left transition-colors",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="flex size-5 shrink-0 items-center justify-center">
        {variant === "app" && props.app ? (
          <AppIcon
            iconUrl={props.app.iconUrl}
            invertInDark={props.app.invertInDark}
          />
        ) : (
          <Package size={16} className="text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1 flex items-center gap-1.5">
        <span className="truncate font-mono text-xs">{name}</span>
        {variant === "package" && "packageType" in props && (
          <Badge
            variant="outline"
            className="font-mono text-[10px] font-medium"
          >
            {props.packageType}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {variant === "app" && props.showInfoPopover && props.app && (
          <AppInfoPopover app={props.app} />
        )}
        {variant === "package" && props.onRemove && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              props.onRemove(id);
            }}
            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-60 hover:opacity-100! focus:opacity-100"
          >
            <XIcon size={12} />
            <span className="sr-only">Remove {name}</span>
          </Button>
        )}
        <SelectionCheckbox
          isSelected={isSelected}
          onToggle={onToggle}
          appId={id}
        />
      </div>
    </div>
  );
}
