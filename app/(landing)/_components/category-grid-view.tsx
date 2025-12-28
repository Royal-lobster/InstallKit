import type { App, AppCategory } from "@/lib/schema";
import { CategorySection } from "./category-section";

interface CategoryGridViewProps {
  appsByCategory: Map<AppCategory, App[]>;
  categories: Array<{ id: AppCategory; label: string }>;
  selectedApps: Set<string>;
  onToggle: (appId: string) => void;
}

export function CategoryGridView({
  appsByCategory,
  categories,
  selectedApps,
  onToggle,
}: CategoryGridViewProps) {
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
