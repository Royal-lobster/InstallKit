"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAllPackages,
  getLastUpdated,
  type HomebrewPackage,
  hasPackages,
  savePackages,
} from "./db";
import {
  clearIndex,
  createSearchIndex,
  getPackageFromIndex,
  isIndexReady,
  type SearchResult,
  searchPackages,
} from "./search";

// Stale time: 30 minutes
const STALE_TIME_MS = 30 * 60 * 1000;

// API endpoints
const FORMULAE_URL = "https://formulae.brew.sh/api/formula.json";
const CASKS_URL = "https://formulae.brew.sh/api/cask.json";

type RawFormula = {
  name: string;
  full_name: string;
  desc: string;
  homepage: string;
  versions: {
    stable: string;
  };
};

type RawCask = {
  token: string;
  name: string[];
  desc: string;
  homepage: string;
  version: string;
};

export type CatalogueState = {
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  packageCount: number;
};

type CatalogueStore = {
  state: CatalogueState;
  listeners: Set<() => void>;
  initPromise: Promise<void> | null;
};

// Global store to share state across all hook instances
const store: CatalogueStore = {
  state: {
    isLoading: false,
    isReady: false,
    error: null,
    packageCount: 0,
  },
  listeners: new Set(),
  initPromise: null,
};

// Track if we're already initialized to prevent multiple attempts
let isInitialized = false;

function updateState(partial: Partial<CatalogueState>) {
  store.state = { ...store.state, ...partial };
  for (const listener of store.listeners) {
    listener();
  }
}

async function fetchCatalogue(): Promise<HomebrewPackage[]> {
  const [formulaeRes, casksRes] = await Promise.all([
    fetch(FORMULAE_URL),
    fetch(CASKS_URL),
  ]);

  if (!formulaeRes.ok) {
    throw new Error("Failed to fetch formulae");
  }
  if (!casksRes.ok) {
    throw new Error("Failed to fetch casks");
  }

  const [formulaeData, casksData] = await Promise.all([
    formulaeRes.json() as Promise<RawFormula[]>,
    casksRes.json() as Promise<RawCask[]>,
  ]);

  // Process and optimize data to reduce memory usage
  const packages: HomebrewPackage[] = [];
  
  // Process casks first (they're usually what users want for GUI apps)
  for (const cask of casksData) {
    packages.push({
      token: cask.token,
      name: Array.isArray(cask.name) ? cask.name[0] : cask.name,
      desc: cask.desc || "",
      homepage: cask.homepage || "",
      version: cask.version || "",
      type: "cask" as const,
    });
  }
  
  // Then process formulae
  for (const formula of formulaeData) {
    packages.push({
      token: formula.name,
      name: formula.full_name,
      desc: formula.desc || "",
      homepage: formula.homepage || "",
      version: formula.versions?.stable || "",
      type: "formula" as const,
    });
  }
  
  // Clear source data to free memory
  formulaeData.length = 0;
  casksData.length = 0;
  
  return packages;
}

async function initializeCatalogue(): Promise<void> {
  // Check if we already have data in IndexedDB
  const [hasCachedData, lastUpdated] = await Promise.all([
    hasPackages(),
    getLastUpdated(),
  ]);

  const isStale = !lastUpdated || Date.now() - lastUpdated > STALE_TIME_MS;

  if (hasCachedData && !isStale) {
    // Load from IndexedDB
    const packages = await getAllPackages();
    createSearchIndex(packages);
    updateState({
      isLoading: false,
      isReady: true,
      packageCount: packages.length,
    });
    return;
  }

  if (hasCachedData && isStale) {
    // Load stale data first for instant search, then refresh in background
    const packages = await getAllPackages();
    createSearchIndex(packages);
    updateState({
      isLoading: false,
      isReady: true,
      packageCount: packages.length,
    });

    // Background refresh
    refreshCatalogueInBackground();
    return;
  }

  // No cached data, need to fetch
  updateState({ isLoading: true });

  try {
    const packages = await fetchCatalogue();
    await savePackages(packages);
    createSearchIndex(packages);
    updateState({
      isLoading: false,
      isReady: true,
      packageCount: packages.length,
    });
  } catch (error) {
    updateState({
      isLoading: false,
      error:
        error instanceof Error ? error : new Error("Failed to load catalogue"),
    });
  }
}

async function refreshCatalogueInBackground(): Promise<void> {
  try {
    const packages = await fetchCatalogue();
    await savePackages(packages);
    createSearchIndex(packages);
    updateState({ packageCount: packages.length });
  } catch {
    // Silently fail background refresh - we already have data
    console.warn("Background catalogue refresh failed");
  }
}

/**
 * Hook to manage the Homebrew catalogue.
 *
 * This hook:
 * - Loads catalogue from IndexedDB on mount (after page load)
 * - Fetches fresh data if cache is stale or missing
 * - Provides search functionality
 * - Provides package lookup by token
 *
 * All state is shared across hook instances.
 */
export function useHomebrewCatalogue() {
  const [state, setState] = useState(store.state);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Subscribe to store updates
    const listener = () => setState(store.state);
    store.listeners.add(listener);

    // Initialize catalogue after page load (using requestIdleCallback if available)
    if (!hasInitialized.current && !store.initPromise && !isInitialized) {
      hasInitialized.current = true;
      isInitialized = true;

      const init = () => {
        // Double-check we haven't already started initialization
        if (!store.initPromise) {
          store.initPromise = initializeCatalogue();
        }
      };

      // Delay initialization to after page load
      if (typeof window !== "undefined") {
        if ("requestIdleCallback" in window) {
          (
            window as typeof window & {
              requestIdleCallback: (cb: () => void) => number;
            }
          ).requestIdleCallback(init, { timeout: 2000 });
        } else {
          // Fallback for Safari
          setTimeout(init, 100);
        }
      }
    }

    // Cleanup on page unload to prevent memory leaks
    const handleBeforeUnload = () => {
      clearIndex();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      store.listeners.delete(listener);
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };
  }, []);

  const search = useCallback(
    (query: string, limit?: number): SearchResult[] => {
      if (!isIndexReady()) return [];
      return searchPackages(query, limit);
    },
    [],
  );

  const getPackage = useCallback(
    (token: string): HomebrewPackage | undefined => {
      return getPackageFromIndex(token);
    },
    [],
  );

  return {
    ...state,
    search,
    getPackage,
  };
}
