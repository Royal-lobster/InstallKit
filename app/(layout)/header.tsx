"use client";

import {
  GithubLogo,
  MagnifyingGlassIcon,
  TerminalWindowIcon,
  XIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  selectedCount: number;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({
  selectedCount,
  onClearAll,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-background">
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
  );
}
