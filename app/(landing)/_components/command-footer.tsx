"use client";

import { CheckIcon, CopyIcon, TrashIcon } from "@phosphor-icons/react";

import { Button } from "@/app/components/ui/button";
import { Toggle } from "@/app/components/ui/toggle";
import { cn } from "@/lib/utils";

interface CommandFooterProps {
  brewCommand: string;
  uninstallCommand: string;
  selectedCount: number;
  copied: boolean;
  isUninstallMode: boolean;
  onCopy: () => void;
  onToggleMode: () => void;
}

export function CommandFooter({
  brewCommand,
  uninstallCommand,
  selectedCount,
  copied,
  isUninstallMode,
  onCopy,
  onToggleMode,
}: CommandFooterProps) {
  const displayCommand = isUninstallMode ? uninstallCommand : brewCommand;
  const commandLabel = isUninstallMode ? "uninstall" : "install";

  return (
    <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-stretch gap-2">
          <Toggle
            pressed={isUninstallMode}
            onPressedChange={onToggleMode}
            variant="outline"
            size="lg"
            className={cn(
              "shrink-0 h-auto! min-w-max~ px-3 py-2.5",
              isUninstallMode &&
                "bg-destructive! text-destructive-foreground! border-destructive! !hover:bg-destructive/90",
            )}
            aria-label="Toggle uninstall mode"
          >
            <TrashIcon className="size-4" />
          </Toggle>
          <div
            className={cn(
              "flex flex-1 items-center overflow-x-auto border border-border bg-card px-3 font-mono text-xs",
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
            className="h-auto shrink-0 gap-1.5 px-4 py-2.5 font-mono text-xs"
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
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} app${selectedCount !== 1 ? "s" : ""} selected • ${isUninstallMode ? "Uninstall" : "Install"} mode`
            : `Select apps to generate brew ${commandLabel} command`}
        </p>
      </div>
    </footer>
  );
}
