"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AppCategory } from "@/lib/data/schema";
import { useCategory } from "../_hooks/use-category";

interface CategoriesProps {
  categories: Array<{ id: AppCategory; label: string }>;
}

export function Categories({ categories }: CategoriesProps) {
  const { selectedCategory, setSelectedCategory } = useCategory();

  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <ToggleGroup
          value={[selectedCategory]}
          onValueChange={(values: Array<string>) => {
            const newValue = values.find((v) => v !== selectedCategory);
            if (newValue) {
              setSelectedCategory(newValue as AppCategory | "all");
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
      </div>
    </div>
  );
}
