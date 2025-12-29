import type { App } from "@/lib/data/schema";
import { AppCard } from "./app-card";

interface AppGridViewProps {
  apps: App[];
  selectedApps: Set<string>;
  onToggle: (appId: string) => void;
}

export function AppGridView({
  apps,
  selectedApps,
  onToggle,
}: AppGridViewProps) {
  return (
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
  );
}
