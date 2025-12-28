"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AppCategory } from "@/lib/schema";

interface CategoryFilterProps {
  categories: Array<{ id: AppCategory; label: string }>;
  selectedCategory: AppCategory | "all";
  onCategoryChange: (category: AppCategory | "all") => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
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
