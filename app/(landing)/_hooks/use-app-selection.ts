"use client";

import { useCallback, useState } from "react";

export function useAppSelection(initialSelectedIds: string[] = []) {
  const [selectedApps, setSelectedApps] = useState<Set<string>>(
    new Set(initialSelectedIds),
  );

  const toggleApp = useCallback((appId: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedApps(new Set());
  }, []);

  return {
    selectedApps,
    toggleApp,
    clearAll,
  };
}
