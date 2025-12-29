"use client";

import { CheckIcon, CopyIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useBoolean } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCopyCommand } from "../_hooks/use-copy-command";
import { ShareDialog } from "./share-dialog";

interface CommandFooterProps {
  brewCommand: string;
  uninstallCommand: string;
  selectedCount: number;
  selectedApps?: string[]; // For analytics
  fullCatalogPackagesCount?: number; // For analytics
}

export function CommandFooter({
  brewCommand,
  uninstallCommand,
  selectedCount,
  selectedApps = [],
  fullCatalogPackagesCount = 0,
}: CommandFooterProps) {
  const uninstallMode = useBoolean(false);
  const { handleCopy, isCopied } = useCopyCommand();

  const isUninstallMode = uninstallMode.value;
  const displayCommand = isUninstallMode ? uninstallCommand : brewCommand;
  const copied = isCopied(displayCommand);

  const handleCopyClick = () => {
    handleCopy(displayCommand, {
      type: "brew_command",
      command: displayCommand,
      selectedAppsCount: selectedCount - fullCatalogPackagesCount,
      fullCatalogPackagesCount,
      isUninstallMode,
      selectedApps,
    });
  };
  const commandLabel = isUninstallMode ? "uninstall" : "install";
  const controlHeight = "h-9 min-h-[36px]";

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-stretch gap-3">
            <div
              className={cn(
                "flex flex-1 items-center overflow-x-auto rounded-md border border-input bg-secondary/50 px-4 font-mono text-xs transition-colors scrollbar-hide",
                controlHeight,
                !displayCommand && "text-muted-foreground",
              )}
            >
              <code className="whitespace-nowrap">
                {displayCommand
                  ? `$ ${displayCommand}`
                  : `$ brew ${commandLabel} --cask ...`}
              </code>
            </div>
            <Button
              onClick={handleCopyClick}
              disabled={!displayCommand}
              size="lg"
              className={cn(
                "shrink-0 gap-2 px-5 py-2.5 font-mono text-xs shadow-sm transition-all active:scale-95",
                controlHeight,
              )}
            >
              {copied ? (
                <>
                  <CheckIcon className="size-3.5" weight="bold" />
                  COPIED
                </>
              ) : (
                <>
                  <CopyIcon className="size-3.5" />
                  COPY
                </>
              )}
            </Button>
            <ShareDialog
              disabled={!displayCommand}
              triggerProps={{
                className: cn(
                  "flex items-center justify-center shrink-0 gap-2 rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium shadow-sm transition-all active:scale-95",
                  controlHeight,
                  "hover:bg-accent hover:text-accent-foreground",
                ),
                type: "button",
                "aria-label": "Share installation kit",
              }}
            >
              <ShareNetworkIcon className="size-4" />
            </ShareDialog>
          </div>

          <div className="flex items-center justify-between gap-3 text-muted-foreground/80">
            <p className="font-mono text-[10px] sm:text-left">
              {selectedCount > 0
                ? `${selectedCount} app${selectedCount !== 1 ? "s" : ""} selected • ${isUninstallMode ? "Uninstall" : "Install"} mode`
                : `Select apps to generate brew ${commandLabel} command`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium tracking-tight">
                Uninstall mode
              </span>
              <Switch
                checked={isUninstallMode}
                onCheckedChange={uninstallMode.toggle}
                aria-label="Toggle uninstall mode"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
