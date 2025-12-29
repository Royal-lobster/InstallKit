"use client";

import {
  ArrowRight,
  ArrowSquareOut,
  CheckIcon,
  MagnifyingGlassIcon,
  Package,
  PlusIcon,
  SpinnerGapIcon,
  Star,
} from "@phosphor-icons/react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CURATED_APPS } from "@/lib/data/curated-catalogue";
import type { SearchResult } from "@/lib/integrations/search";
import { useFullCatalogSearch } from "../_hooks/use-full-catalog-search";

interface FullCatalogSearchProps {
  onSelectPackage: (pkg: SearchResult) => void;
  selectedTokens: Set<string>;
}

function SearchResultItem({
  pkg,
  isSelected,
  isInCatalog,
  onSelect,
}: {
  pkg: SearchResult;
  isSelected: boolean;
  isInCatalog: boolean;
  onSelect: (pkg: SearchResult) => void;
}) {
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

function FullCatalogTrigger() {
  return (
    <div className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-xl border border-border bg-card/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-card hover:shadow-sm sm:p-5">
      <div className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <MagnifyingGlassIcon className="size-5" weight="bold" />
        </div>
        <div className="space-y-0.5">
          <h3 className="font-mono text-sm font-medium leading-none transition-colors group-hover:text-primary">
            Can&apos;t find your app?
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground">
            Search the full catalog
          </p>
        </div>
      </div>
      <div className="hidden shrink-0 text-muted-foreground transition-colors group-hover:text-primary sm:block">
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          weight="bold"
        />
      </div>
    </div>
  );
}

export function FullCatalogSearch({
  onSelectPackage,
  selectedTokens,
}: FullCatalogSearchProps) {
  const [query, setQuery] = React.useState("");
  const { results, isSearching } = useFullCatalogSearch(query);

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <FullCatalogTrigger />
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-2xl!">
        <DialogTitle className="sr-only">Search Full Catalog</DialogTitle>
        <DialogDescription className="sr-only">
          Search over 10,000+ formulae and casks from the official Homebrew
          repository.
        </DialogDescription>
        <Command shouldFilter={false} className="h-full">
          <div className="relative">
            <CommandInput
              placeholder="Search full catalog..."
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
          <CommandList className="max-h-100 overflow-y-auto p-2">
            {query.trim().length < 2 && (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <MagnifyingGlassIcon className="size-12 text-muted-foreground/20" />
                <div className="space-y-2">
                  <p className="font-mono text-sm text-muted-foreground">
                    Type to search packages
                  </p>
                  <p className="max-w-xs font-mono text-xs text-muted-foreground/50">
                    Search over 10,000+ formulae and casks
                  </p>
                </div>
              </div>
            )}
            {query.trim().length >= 2 &&
              !isSearching &&
              results.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
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
                  const isInCatalog = CURATED_APPS.some(
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
