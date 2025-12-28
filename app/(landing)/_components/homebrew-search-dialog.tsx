"use client";

import {
  ArrowSquareOut,
  CheckIcon,
  MagnifyingGlassIcon,
  Package,
  PlusIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
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
      <DialogContent size="xl" className="h-[min(600px,80vh)]">
        <DialogClose />
        <DialogHeader>
          <DialogTitle className="font-mono">
            Search Homebrew Catalogue
          </DialogTitle>
          <DialogDescription>
            Search over 10,000+ formulae and casks from the official Homebrew
            repository.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search packages..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
              className="pl-9 font-mono text-sm"
              autoFocus
            />
            {isSearching && (
              <SpinnerGapIcon className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <DialogBody className="pt-0">
          <SearchResults
            query={query}
            results={results}
            isSearching={isSearching}
            selectedTokens={selectedTokens}
            onSelectPackage={onSelectPackage}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  selectedTokens: Set<string>;
  onSelectPackage: (pkg: SearchResult) => void;
}

function SearchResults({
  query,
  results,
  isSearching,
  selectedTokens,
  onSelectPackage,
}: SearchResultsProps) {
  if (query.trim().length < 2) {
    return <EmptyState type="initial" />;
  }

  if (isSearching && results.length === 0) {
    return <LoadingState />;
  }

  if (results.length === 0) {
    return <EmptyState type="no-results" query={query} />;
  }

  return (
    <div className="space-y-1">
      {results.map((pkg) => (
        <SearchResultItem
          key={`${pkg.type}-${pkg.token}`}
          pkg={pkg}
          isSelected={selectedTokens.has(pkg.token)}
          onSelect={onSelectPackage}
        />
      ))}
    </div>
  );
}

interface SearchResultItemProps {
  pkg: SearchResult;
  isSelected: boolean;
  onSelect: (pkg: SearchResult) => void;
}

function SearchResultItem({
  pkg,
  isSelected,
  onSelect,
}: SearchResultItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted/50">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Package className="size-4 text-muted-foreground" weight="duotone" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-sm font-medium">
            {pkg.name}
          </span>
          <Badge
            variant="secondary"
            className="shrink-0 font-mono text-[10px] uppercase"
          >
            {pkg.type}
          </Badge>
          {pkg.version && (
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
              v{pkg.version}
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {pkg.desc || "No description available"}
        </p>
        <code className="mt-1 inline-block font-mono text-[10px] text-muted-foreground/70">
          brew install {pkg.type === "cask" ? "--cask " : ""}
          {pkg.token}
        </code>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 font-mono text-xs"
          onClick={() =>
            window.open(
              `https://formulae.brew.sh/${pkg.type}/${pkg.token}`,
              "_blank",
            )
          }
        >
          <ArrowSquareOut className="size-3.5" weight="bold" />
          Open
        </Button>
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="gap-1.5 font-mono text-xs"
          onClick={() => onSelect(pkg)}
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
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <SpinnerGapIcon className="size-8 animate-spin text-muted-foreground" />
      <p className="font-mono text-xs text-muted-foreground">
        Searching Homebrew catalogue...
      </p>
    </div>
  );
}

interface EmptyStateProps {
  type: "initial" | "no-results";
  query?: string;
}

function EmptyState({ type, query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Package className="size-6 text-muted-foreground" weight="duotone" />
      </div>
      {type === "initial" ? (
        <>
          <p className="font-mono text-sm text-muted-foreground">
            Start typing to search
          </p>
          <p className="max-w-xs font-mono text-xs text-muted-foreground/70">
            Search for any formula or cask in the Homebrew catalogue
          </p>
        </>
      ) : (
        <>
          <p className="font-mono text-sm text-muted-foreground">
            No packages found
          </p>
          <p className="max-w-xs font-mono text-xs text-muted-foreground/70">
            No results for &quot;{query}&quot;. Try a different search term.
          </p>
        </>
      )}
    </div>
  );
}
