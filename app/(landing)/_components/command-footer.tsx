"use client";

import {
  CheckIcon,
  CopyIcon,
  QuestionIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useBoolean } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useCopyCommand } from "../_hooks/use-copy-command";
import { InstallationHelpDialog } from "./installation-help-dialog";
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
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

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
    // Open popover after copying
    setPopoverOpen(true);
  };

  const handleOpenHelp = () => {
    setPopoverOpen(false);
    setShowHelpDialog(true);
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
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger
                onClick={handleCopyClick}
                disabled={!displayCommand}
                className={cn(
                  "shrink-0 gap-2 px-5 py-2.5 font-mono text-xs shadow-sm transition-all active:scale-95 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
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
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 overflow-hidden"
                align="end"
                side="top"
                sideOffset={8}
              >
                <div className="p-4 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckIcon className="size-4" weight="bold" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Command copied!</h4>
                      <p className="text-xs text-muted-foreground leading-snug">
                        Paste the command into your terminal to{" "}
                        {isUninstallMode ? "uninstall" : "install"} your apps.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t bg-muted/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      New to Terminal?
                    </p>
                    <Button
                      onClick={handleOpenHelp}
                      variant="secondary"
                      size="sm"
                      className="h-7 px-3 text-xs gap-1.5"
                    >
                      <QuestionIcon className="size-3.5" weight="bold" />
                      View Guide
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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

      {/* Installation Help Dialog */}
      <InstallationHelpDialog
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
        command={displayCommand}
        isUninstallMode={isUninstallMode}
      />
    </footer>
  );
}
