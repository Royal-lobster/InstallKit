import { usePostHog } from "posthog-js/react";

export interface CopyEvent {
  type: "brew_command" | "sync_command";
  command?: string;
  selectedAppsCount?: number;
  isUninstallMode?: boolean;
  selectedApps?: string[];
  fullCatalogPackagesCount?: number;
}

export function useAnalytics() {
  const posthog = usePostHog();

  const trackCopy = (event: CopyEvent) => {
    if (!posthog) return;

    posthog.capture("copy_command", {
      ...event,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackCopy,
  };
}
