"use client";

import {
  ArrowRight,
  MagnifyingGlassIcon,
  Package,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APPS } from "@/lib/data/apps";
import { range } from "@/lib/helpers/range";
import type { SearchResult } from "@/lib/integrations/search";
import { useHomebrewSearch } from "../_hooks/use-homebrew-search";
import { SearchResultItem } from "./search-result-item";

interface HomebrewSearchDialogProps {
  onSelectPackage: (pkg: SearchResult) => void;
  selectedTokens: Set<string>;
}

export function HomebrewSearchDialog({
  onSelectPackage,
  selectedTokens,
}: HomebrewSearchDialogProps) {
  const [query, setQuery] = React.useState("");
  const { results, isSearching } = useHomebrewSearch(query);

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <HomebrewCatalogueTrigger />
      </DialogTrigger>
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

function HomebrewCatalogueTrigger() {
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
            Search 10,000+ formulae and casks in the Homebrew catalogue
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
