import type { App, AppCategory } from "@/lib/data/schema";
import { CATEGORIES } from "@/lib/data/schema";
import { AppCard } from "./app-card";

interface AppGridByCategoryProps {
  appsByCategory: Map<AppCategory, App[]>;
  selectedApps: Set<string>;
  onToggleApp: (appId: string) => void;
}

export function AppGridByCategory({
  appsByCategory,
  selectedApps,
  onToggleApp,
}: AppGridByCategoryProps) {
  return (
    <>
      {Array.from(appsByCategory.entries()).map(([category, apps]) => {
        const categoryInfo = CATEGORIES.find((c) => c.id === category);
        if (!categoryInfo) return null;

        return (
          <section key={category}>
            <CategoryHeader label={categoryInfo.label} count={apps.length} />
            <AppGrid
              apps={apps}
              selectedApps={selectedApps}
              onToggleApp={onToggleApp}
            />
          </section>
        );
      })}
    </>
  );
}

interface CategoryHeaderProps {
  label: string;
  count: number;
}

function CategoryHeader({ label, count }: CategoryHeaderProps) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
      <span className="font-mono text-[10px] text-muted-foreground/60">
        ({count})
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

interface AppGridProps {
  apps: App[];
  selectedApps: Set<string>;
  onToggleApp: (appId: string) => void;
}

export function AppGrid({ apps, selectedApps, onToggleApp }: AppGridProps) {
  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          isSelected={selectedApps.has(app.id)}
          onToggle={() => onToggleApp(app.id)}
        />
      ))}
    </div>
  );
}
