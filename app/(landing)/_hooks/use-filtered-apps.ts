"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { CURATED_APPS } from "@/lib/data/curated-catalogue";
import type { App, AppCategory } from "@/lib/data/schema";
import { CATEGORIES } from "@/lib/data/schema";

// Static Fuse instance - APPS never changes, so we can create this once
const appSearchIndex = new Fuse(CURATED_APPS, {
  keys: ["name", "description", "brewName"],
  threshold: 0.4,
  ignoreLocation: true,
});

export function useFilteredApps(
  searchQuery: string,
  selectedCategory: AppCategory | "all",
) {
  const filteredApps = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    let result: App[];

    if (trimmedQuery) {
      result = appSearchIndex.search(trimmedQuery).map((r) => r.item);
    } else {
      result = CURATED_APPS;
    }

    if (selectedCategory !== "all") {
      result = result.filter((app) => app.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const appsByCategory = useMemo(() => {
    const grouped = new Map<AppCategory, App[]>();

    for (const category of CATEGORIES) {
      const categoryApps = filteredApps.filter(
        (app) => app.category === category.id,
      );
      if (categoryApps.length > 0) {
        grouped.set(category.id, categoryApps);
      }
    }

    return grouped;
  }, [filteredApps]);

  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasResults = filteredApps.length > 0;

  return {
    filteredApps,
    appsByCategory,
    hasSearchQuery,
    hasResults,
  };
}
