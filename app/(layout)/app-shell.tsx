"use client";

import {
  CheckIcon,
  CloudArrowUpIcon,
  CopyIcon,
  GithubLogo,
  MagnifyingGlassIcon,
  ShareNetworkIcon,
  TerminalWindowIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import { SyncDialog } from "@/app/(landing)/_components/sync-dialog";
import { useBrewPickerContext } from "@/app/(landing)/_hooks/use-brew-picker-context";
import { useSearchQuery } from "@/app/(landing)/_hooks/use-search-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function AppShell({ children }: React.PropsWithChildren) {
  const {
    selectedCount,
    onClearAll,
    brewCommand,
    uninstallCommand,
    copied,
    isUninstallMode,
    onCopy,
    onToggleMode,
    onShare,
  } = useBrewPickerContext();

  const { searchQuery, setSearchQuery } = useSearchQuery();
  const [isSyncDialogOpen, setIsSyncDialogOpen] = React.useState(false);
  const displayCommand = isUninstallMode ? uninstallCommand : brewCommand;
  const commandLabel = isUninstallMode ? "uninstall" : "install";
  const controlHeight = "h-9 min-h-[36px]";
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-3">
          {/* Desktop Header */}
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
            {/* Left: Logo & Branding */}
            <div className="flex items-center gap-3">
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <TerminalWindowIcon className="size-5" weight="bold" />
                {/* Selection indicator dot */}
                <span
                  className={cn(
                    "absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background transition-all duration-200",
                    hasSelection
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0",
                  )}
                >
                  {selectedCount > 99 ? "99+" : selectedCount}
                </span>
              </div>
              <div className="flex flex-col">
                <h1 className="font-mono text-sm font-bold tracking-tight">
                  INSTALLKIT
                </h1>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Select → Copy → Install
                </p>
              </div>
            </div>

            {/* Center: Search */}
            <div className="relative max-w-md flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="h-9 w-full pl-10 pr-9 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 hover:text-foreground",
                  searchQuery ? "scale-100 opacity-100" : "scale-0 opacity-0",
                )}
              >
                <XIcon className="size-4" />
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSyncDialogOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Sync existing Homebrew setup"
              >
                <CloudArrowUpIcon className="size-4" weight="bold" />
                <span>Sync</span>
              </button>
              <a
                href="https://github.com/Royal-lobster/InstallKit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="View source on GitHub"
              >
                <GithubLogo className="size-4" weight="bold" />
              </a>
              <div className="mx-1 h-5 w-px bg-border" />
              {/* Clear button - always rendered, visibility controlled via opacity */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                disabled={!hasSelection}
                className={cn(
                  "gap-1.5 font-mono text-xs transition-all duration-200",
                  hasSelection
                    ? "opacity-100"
                    : "pointer-events-none opacity-0",
                )}
              >
                <TrashIcon className="size-3.5" />
                Clear {hasSelection && `(${selectedCount})`}
              </Button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Top row: Logo, actions, selection badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <TerminalWindowIcon className="size-4" weight="bold" />
                </div>
                <div>
                  <h1 className="font-mono text-sm font-bold tracking-tight">
                    INSTALLKIT
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Selection badge with clear action */}
                <button
                  type="button"
                  onClick={onClearAll}
                  disabled={!hasSelection}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-full bg-foreground/10 px-2.5 font-mono text-xs font-medium transition-all duration-200",
                    hasSelection
                      ? "opacity-100"
                      : "pointer-events-none opacity-0",
                  )}
                >
                  <span>{selectedCount} selected</span>
                  <XIcon className="size-3" weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSyncDialogOpen(true)}
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Sync existing Homebrew setup"
                >
                  <CloudArrowUpIcon className="size-4" weight="bold" />
                </button>
                <a
                  href="https://github.com/Royal-lobster/InstallKit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="View source on GitHub"
                >
                  <GithubLogo className="size-4" weight="bold" />
                </a>
              </div>
            </div>
            {/* Search row */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="h-10 w-full pl-10 pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 hover:text-foreground",
                  searchQuery ? "scale-100 opacity-100" : "scale-0 opacity-0",
                )}
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Footer */}
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

      <SyncDialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen} />
    </div>
  );
}
