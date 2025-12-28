"use client";

import { ArrowRight, MagnifyingGlassIcon } from "@phosphor-icons/react";

interface CatalogueSearchCTAProps {
  onOpenSearch: () => void;
}

export function CatalogueSearchCTA({ onOpenSearch }: CatalogueSearchCTAProps) {
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onOpenSearch}
        className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-xl border border-border bg-card/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-card hover:shadow-sm sm:p-5"
      >
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
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" weight="bold" />
        </div>
      </button>
    </div>
  );
}
