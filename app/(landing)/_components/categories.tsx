"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { App, AppCategory } from "@/lib/data/schema";
import { AppCard } from "./app-card";

interface CategoriesProps {
  categories: Array<{ id: AppCategory; label: string }>;
  selectedCategory?: AppCategory | "all";
  onCategoryChange?: (category: AppCategory | "all") => void;
  // For grid view mode
  appsByCategory?: Map<AppCategory, App[]>;
  selectedApps?: Set<string>;
  onToggle?: (appId: string) => void;
  showGrid?: boolean;
}

function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  categories: Array<{ id: AppCategory; label: string }>;
  selectedCategory: AppCategory | "all";
  onCategoryChange: (category: AppCategory | "all") => void;
}) {
  return (
    <ToggleGroup
      value={[selectedCategory]}
      onValueChange={(values: Array<string>) => {
        const newValue = values.find((v) => v !== selectedCategory);
        if (newValue) {
          onCategoryChange(newValue as AppCategory | "all");
        }
      }}
      spacing={1}
      className="w-full justify-start overflow-x-auto no-scrollbar sm:flex-wrap sm:overflow-visible"
    >
      <ToggleGroupItem
        value="all"
        className="px-2.5 py-1 font-mono text-[11px] whitespace-nowrap"
      >
        All
      </ToggleGroupItem>
      {categories.map((category) => (
        <ToggleGroupItem
          key={category.id}
          value={category.id}
          className="px-2.5 py-1 font-mono text-[11px] whitespace-nowrap"
        >
          {category.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function CategorySection({
  categoryId,
  apps,
  categories,
  selectedApps,
  onToggle,
}: {
  categoryId: AppCategory;
  apps: Array<App>;
  categories: Array<{ id: AppCategory; label: string }>;
  selectedApps: Set<string>;
  onToggle: (appId: string) => void;
}) {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {category.label}
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground/60">
          ({apps.length})
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {apps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            isSelected={selectedApps.has(app.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryGridView({
  appsByCategory,
  categories,
  selectedApps,
  onToggle,
}: {
  appsByCategory: Map<AppCategory, App[]>;
  categories: Array<{ id: AppCategory; label: string }>;
  selectedApps: Set<string>;
  onToggle: (appId: string) => void;
}) {
  return (
    <div className="space-y-8">
      {Array.from(appsByCategory.entries()).map(
        ([categoryId, categoryApps]) => (
          <CategorySection
            key={categoryId}
            categoryId={categoryId}
            apps={categoryApps}
            categories={categories}
            selectedApps={selectedApps}
            onToggle={onToggle}
          />
        ),
      )}
    </div>
  );
}

export function Categories({
  categories,
  selectedCategory,
  onCategoryChange,
  appsByCategory,
  selectedApps,
  onToggle,
  showGrid = false,
}: CategoriesProps) {
  // Filter mode - just show the category selector
  if (!showGrid && selectedCategory && onCategoryChange) {
    return (
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
    );
  }

  // Grid view mode - show categorized apps
  if (showGrid && appsByCategory && selectedApps && onToggle) {
    return (
      <CategoryGridView
        appsByCategory={appsByCategory}
        categories={categories}
        selectedApps={selectedApps}
        onToggle={onToggle}
      />
    );
  }

  return null;
}
