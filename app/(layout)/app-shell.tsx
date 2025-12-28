"use client";

import {
  CheckIcon,
  CopyIcon,
  GithubLogo,
  MagnifyingGlassIcon,
  ShareNetworkIcon,
  TerminalWindowIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  selectedCount: number;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  brewCommand: string;
  uninstallCommand: string;
  copied: boolean;
  isUninstallMode: boolean;
  onCopy: () => void;
  onToggleMode: () => void;
  onShare?: () => void;
}

export function AppShell({
  children,
  selectedCount,
  onClearAll,
  searchQuery,
  onSearchChange,
  brewCommand,
  uninstallCommand,
  copied,
  isUninstallMode,
  onCopy,
  onToggleMode,
  onShare,
}: AppShellProps) {
  const displayCommand = isUninstallMode ? uninstallCommand : brewCommand;
  const commandLabel = isUninstallMode ? "uninstall" : "install";
  const controlHeight = "h-9 min-h-[36px]";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <TerminalWindowIcon className="size-5" weight="bold" />
              </div>
              <div>
                <h1 className="font-mono text-sm font-bold tracking-tight">
                  INSTALLKIT
                </h1>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Select apps → Copy brew command → Paste in terminal
                </p>
              </div>
              <a
                href="https://github.com/Royal-lobster/InstallKit"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
                aria-label="View source on GitHub"
              >
                <GithubLogo className="size-4" weight="bold" />
              </a>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:w-auto">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onSearchChange(e.target.value)
                  }
                  className="h-9 w-full pl-8 pr-8 font-mono text-sm sm:h-8 sm:w-56 sm:text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                )}
              </div>
              <a
                href="https://github.com/Royal-lobster/InstallKit"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
                aria-label="View source on GitHub"
              >
                <GithubLogo className="size-4" weight="bold" />
              </a>
              {selectedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="w-full justify-center font-mono text-xs sm:w-auto"
                >
                  Clear ({selectedCount})
                </Button>
              )}
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
    </div>
  );
}
