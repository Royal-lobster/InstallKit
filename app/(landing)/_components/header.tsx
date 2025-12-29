"use client";

import {
  CloudArrowUpIcon,
  GithubLogo,
  MagnifyingGlassIcon,
  TerminalWindowIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SyncDialog } from "./sync-dialog";

interface HeaderProps {
  selectedCount: number;
  onClearAll: () => void;
}

export function Header({ selectedCount, onClearAll }: HeaderProps) {
  const [searchQuery = "", setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const hasSelection = selectedCount > 0;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-3">
        {/* Desktop Header */}
        <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
          {/* Left: Logo & Branding */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TerminalWindowIcon className="size-5" weight="bold" />
              {/* Selection indicator dot */}
              <span
                className={cn(
                  "absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background transition-all duration-200",
                  hasSelection ? "scale-100 opacity-100" : "scale-0 opacity-0",
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
          </Link>

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
            <SyncDialog
              triggerProps={{
                className:
                  "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                "aria-label": "Sync existing Homebrew setup",
                type: "button",
              }}
            >
              <CloudArrowUpIcon className="size-4" weight="bold" />
              <span>Sync</span>
            </SyncDialog>
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
                hasSelection ? "opacity-100" : "pointer-events-none opacity-0",
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
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <TerminalWindowIcon className="size-4" weight="bold" />
              </div>
              <div>
                <h1 className="font-mono text-sm font-bold tracking-tight">
                  INSTALLKIT
                </h1>
              </div>
            </Link>
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
              <SyncDialog
                triggerProps={{
                  className:
                    "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  "aria-label": "Sync existing Homebrew setup",
                  type: "button",
                }}
              >
                <CloudArrowUpIcon className="size-4" weight="bold" />
              </SyncDialog>
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
  );
}
