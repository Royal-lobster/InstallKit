"use client";

import { CheckIcon, CopyIcon, ShareNetworkIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CommandFooterProps {
  brewCommand: string;
  uninstallCommand: string;
  selectedCount: number;
  copied: boolean;
  isUninstallMode: boolean;
  onCopy: () => void;
  onToggleMode: () => void;
  onShare?: () => void;
}

export function CommandFooter({
  brewCommand,
  uninstallCommand,
  selectedCount,
  copied,
  isUninstallMode,
  onCopy,
  onToggleMode,
  onShare,
}: CommandFooterProps) {
  const displayCommand = isUninstallMode ? uninstallCommand : brewCommand;
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
              onClick={onCopy}
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
            {onShare && (
              <Button
                onClick={onShare}
                disabled={!displayCommand}
                variant="outline"
                size="lg"
                className={cn(
                  "shrink-0 px-3 py-2.5 shadow-sm transition-all active:scale-95",
                  controlHeight,
                )}
              >
                <ShareNetworkIcon className="size-4" />
              </Button>
            )}
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
                onCheckedChange={onToggleMode}
                aria-label="Toggle uninstall mode"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
