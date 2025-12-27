import {
  MagnifyingGlassIcon,
  TerminalWindowIcon,
  XIcon,
} from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header({
  selectedCount,
  onClearAll,
  searchQuery,
  onSearchChange,
}: {
  selectedCount: number
  onClearAll: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TerminalWindowIcon className="size-5" weight="bold" />
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold tracking-tight">
                TAKEOVER
              </h1>
              <p className="font-mono text-[10px] text-muted-foreground">
                Select apps → Copy brew command → Paste in terminal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 w-40 pl-8 pr-8 font-mono text-xs md:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
            {selectedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="font-mono text-xs"
              >
                Clear ({selectedCount})
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
