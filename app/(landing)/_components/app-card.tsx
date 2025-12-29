"use client";

import type { App } from "@/lib/data/schema";
import { AppSelectionCard } from "./app-selection-card";

interface AppCardProps {
  app: App;
  isSelected: boolean;
  onToggle: (appId: string) => void;
}

export function AppCard({ app, isSelected, onToggle }: AppCardProps) {
  return (
    <AppSelectionCard
      variant="app"
      id={app.id}
      name={app.name}
      app={app}
      isSelected={isSelected}
      onToggle={onToggle}
      showInfoPopover={true}
    />
  );
}
