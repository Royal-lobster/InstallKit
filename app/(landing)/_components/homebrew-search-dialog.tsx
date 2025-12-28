"use client";

import {
  ArrowSquareOut,
  CheckIcon,
  MagnifyingGlassIcon,
  Package,
  PlusIcon,
  SpinnerGapIcon,
  Star,
} from "@phosphor-icons/react";
import * as React from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { APPS } from "@/lib/data/apps";
import { range } from "@/lib/helpers/range";
import type { SearchResult } from "../_actions";
import { useHomebrewSearch } from "./_hooks/use-homebrew-search";

interface HomebrewSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPackage: (pkg: SearchResult) => void;
  selectedTokens: Set<string>;
}

export function HomebrewSearchDialog({
  open,
  onOpenChange,
  onSelectPackage,
  selectedTokens,
}: HomebrewSearchDialogProps) {
  const [query, setQuery] = React.useState("");
  const { results, isSearching } = useHomebrewSearch(query);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen) {
        setQuery("");
      }
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-2xl!">
        <DialogTitle className="sr-only">Search Homebrew Catalogue</DialogTitle>
        <DialogDescription className="sr-only">
          Search over 10,000+ formulae and casks from the official Homebrew
          repository.
        </DialogDescription>
        <Command shouldFilter={false} className="h-full">
          <div className="relative">
            <CommandInput
              placeholder="Search Homebrew catalogue..."
              value={query}
              onValueChange={setQuery}
              className="border-0"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <SpinnerGapIcon className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <CommandList className="max-h-[60vh]">
            {query.trim().length < 2 && (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <MagnifyingGlassIcon className="size-8 text-muted-foreground/20" />
                <p className="font-mono text-sm text-muted-foreground">
                  Search Homebrew
                </p>
                <p className="max-w-xs font-mono text-xs text-muted-foreground/50">
                  Find formulae and casks to install
                </p>
              </div>
            )}
            {query.trim().length >= 2 &&
              isSearching &&
              results.length === 0 && (
                <div className="space-y-2 p-3">
                  {range(5).map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5"
                    >
                      <div className="size-8 shrink-0 animate-pulse rounded-md bg-muted" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-full animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            {query.trim().length >= 2 &&
              !isSearching &&
              results.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <Package className="size-8 text-muted-foreground/20" />
                  <p className="font-mono text-sm text-muted-foreground">
                    No results found
                  </p>
                  <p className="max-w-xs font-mono text-xs text-muted-foreground/50">
                    We couldn&apos;t find anything matching &quot;{query}
                    &quot;
                  </p>
                </div>
              )}
            {query.trim().length >= 2 && results.length > 0 && (
              <CommandGroup heading="Results">
                {results.map((pkg) => {
                  const isInCatalog = APPS.some(
                    (app) => app.brewName === pkg.token,
                  );
                  return (
                    <SearchResultItem
                      key={`${pkg.type}-${pkg.token}`}
                      pkg={pkg}
                      isSelected={selectedTokens.has(pkg.token)}
                      isInCatalog={isInCatalog}
                      onSelect={onSelectPackage}
                    />
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

interface SearchResultItemProps {
  pkg: SearchResult;
  isSelected: boolean;
  isInCatalog: boolean;
  onSelect: (pkg: SearchResult) => void;
}

function SearchResultItem({
  pkg,
  isSelected,
  isInCatalog,
  onSelect,
}: SearchResultItemProps) {
  return (
    <CommandItem
      value={`${pkg.name} ${pkg.token} ${pkg.desc}`}
      onSelect={() => onSelect(pkg)}
      className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all duration-200 data-[selected=true]:border-primary/30 data-[selected=true]:bg-primary/5 data-[selected=true]:shadow-sm"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground transition-all duration-200 group-data-[selected=true]:bg-primary/10 group-data-[selected=true]:text-primary">
        {isInCatalog ? (
          <Star className="size-4" weight="fill" />
        ) : (
          <Package className="size-4" weight="duotone" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-sm font-medium transition-colors duration-200 group-data-[selected=true]:text-primary">
            {pkg.name}
          </span>
          <Badge
            variant="secondary"
            className="shrink-0 border-transparent bg-muted/50 font-mono text-[10px] uppercase text-muted-foreground transition-all duration-200 group-data-[selected=true]:bg-primary/10 group-data-[selected=true]:text-primary"
          >
            {pkg.type}
          </Badge>
          {pkg.version && (
            <Badge
              variant="outline"
              className="shrink-0 font-mono text-[10px] text-muted-foreground"
            >
              v{pkg.version}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="truncate text-xs text-muted-foreground group-data-[selected=true]:text-muted-foreground">
            {pkg.desc || "No description available"}
          </p>
        </div>
      </div>
      <div
        className={`flex shrink-0 items-center gap-2 transition-all duration-200 ${isSelected ? "opacity-100" : "opacity-0 group-data-[selected=true]:opacity-100 group-hover:opacity-100"}`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-foreground/60 hover:bg-accent hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            window.open(
              `https://formulae.brew.sh/${pkg.type}/${pkg.token}`,
              "_blank",
            );
          }}
          title="View on Homebrew"
        >
          <ArrowSquareOut className="size-4" />
        </Button>
        <Button
          variant={isSelected ? "secondary" : "default"}
          size="sm"
          className="h-8 gap-1.5 px-3 font-mono text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pkg);
          }}
        >
          {isSelected ? (
            <>
              <CheckIcon className="size-3.5" weight="bold" />
              Added
            </>
          ) : (
            <>
              <PlusIcon className="size-3.5" weight="bold" />
              Add
            </>
          )}
        </Button>
      </div>
    </CommandItem>
  );
}
