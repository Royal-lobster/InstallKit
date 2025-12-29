/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Fine here */

"use client";

import type { App } from "@/lib/data/schema";
import { cn } from "@/lib/utils";
import { AppIcon } from "./app-icon";
import { AppInfoPopover } from "./app-info-popover";
import { SelectionCheckbox } from "./selection-checkbox";

interface AppCardProps {
  app: App;
  isSelected: boolean;
  onToggle: (appId: string) => void;
}

export function AppCard({ app, isSelected, onToggle }: AppCardProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Fine here
    <div
      onClick={(e) => {
        // Prevent toggle if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
          return;
        }
        onToggle(app.id);
      }}
      className={cn(
        "group flex cursor-pointer select-none items-center gap-2.5 border px-2.5 py-2 text-left transition-colors",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="flex size-5 shrink-0 items-center justify-center">
        <AppIcon iconUrl={app.iconUrl} invertInDark={app.invertInDark} />
      </div>
      <span className="min-w-0 flex-1 truncate font-mono text-xs">
        {app.name}
      </span>
      <div className="flex items-center gap-2">
        <AppInfoPopover app={app} />
        <SelectionCheckbox
          isSelected={isSelected}
          onToggle={onToggle}
          appId={app.id}
        />
      </div>
    </div>
  );
}
