import {
  ArrowSquareOut,
  CheckIcon,
  Package,
  PlusIcon,
  Star,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommandItem } from "@/components/ui/command";
import type { SearchResult } from "../_actions";

interface SearchResultItemProps {
  pkg: SearchResult;
  isSelected: boolean;
  isInCatalog: boolean;
  onSelect: (pkg: SearchResult) => void;
}

export function SearchResultItem({
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
