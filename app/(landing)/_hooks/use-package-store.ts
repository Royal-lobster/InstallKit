"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { APPS } from "@/lib/data/apps";
import type { CustomPackage } from "@/lib/helpers/brew-commands";
import { generateBulkBrewCommand } from "@/lib/helpers/brew-commands";

// --- Types ---

interface CustomPackageInput {
  token: string;
  name: string;
  type: "cask" | "formula";
}

interface PackageSelectionState {
  // State
  selectedAppIds: string[];
  customPackages: CustomPackage[];
  selectedCustomPackageIds: string[];
  hydrated: boolean;

  // Actions
  toggleApp: (appId: string) => void;
  clearApps: () => void;
  addCustomPackage: (pkg: CustomPackageInput) => void;
  removeCustomPackage: (token: string, sharedTokens?: Set<string>) => void;
  toggleCustomPackage: (token: string) => void;
  clearAll: (sharedTokens?: Set<string>) => void;
  setHydrated: () => void;
  initializeFromUrl: (
    appIds: string[],
    customPkgs: CustomPackageInput[],
  ) => void;
}

// --- Store ---

export const usePackageStore = create<PackageSelectionState>()(
  persist(
    (set) => ({
      // Initial state
      selectedAppIds: [],
      customPackages: [],
      selectedCustomPackageIds: [],
      hydrated: false,

      // Actions
      toggleApp: (appId: string) => {
        set((state) => {
          const ids = new Set(state.selectedAppIds);
          if (ids.has(appId)) {
            ids.delete(appId);
          } else {
            ids.add(appId);
          }
          return { selectedAppIds: Array.from(ids) };
        });
      },

      clearApps: () => {
        set({ selectedAppIds: [] });
      },

      addCustomPackage: (pkg: CustomPackageInput) => {
        set((state) => {
          const exists = state.customPackages.some(
            (p) => p.token === pkg.token,
          );
          if (exists) return state;
          return {
            customPackages: [...state.customPackages, pkg],
          };
        });
      },

      removeCustomPackage: (token: string, sharedTokens?: Set<string>) => {
        set((state) => {
          // If it's a shared token (from URL), only deselect, don't remove
          if (sharedTokens?.has(token)) {
            return {
              selectedCustomPackageIds: state.selectedCustomPackageIds.filter(
                (id) => id !== token,
              ),
            };
          }
          // Otherwise, remove the package entirely
          return {
            customPackages: state.customPackages.filter(
              (pkg) => pkg.token !== token,
            ),
            selectedCustomPackageIds: state.selectedCustomPackageIds.filter(
              (id) => id !== token,
            ),
          };
        });
      },

      toggleCustomPackage: (token: string) => {
        set((state) => {
          const ids = new Set(state.selectedCustomPackageIds);
          if (ids.has(token)) {
            ids.delete(token);
          } else {
            ids.add(token);
          }
          return { selectedCustomPackageIds: Array.from(ids) };
        });
      },

      clearAll: (sharedTokens?: Set<string>) => {
        set((state) => {
          // Keep shared custom packages but deselect them
          const filteredPackages = sharedTokens
            ? state.customPackages.filter((pkg) => sharedTokens.has(pkg.token))
            : [];

          return {
            selectedAppIds: [],
            customPackages: filteredPackages,
            selectedCustomPackageIds: [],
          };
        });
      },

      setHydrated: () => {
        set({ hydrated: true });
      },

      initializeFromUrl: (
        appIds: string[],
        customPkgs: CustomPackageInput[],
      ) => {
        set((state) => {
          // Merge URL packages with existing, avoiding duplicates
          const existingTokens = new Set(
            state.customPackages.map((p) => p.token),
          );
          const newPackages = customPkgs.filter(
            (pkg) => !existingTokens.has(pkg.token),
          );

          // Merge app IDs, avoiding duplicates
          const existingAppIds = new Set(state.selectedAppIds);
          const newAppIds = appIds.filter((id) => !existingAppIds.has(id));

          // Merge selected custom package IDs
          const existingSelectedIds = new Set(state.selectedCustomPackageIds);
          const newSelectedIds = customPkgs
            .map((p) => p.token)
            .filter((id) => !existingSelectedIds.has(id));

          return {
            selectedAppIds: [...state.selectedAppIds, ...newAppIds],
            customPackages: [...state.customPackages, ...newPackages],
            selectedCustomPackageIds: [
              ...state.selectedCustomPackageIds,
              ...newSelectedIds,
            ],
          };
        });
      },
    }),
    {
      name: "installkit-packages",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAppIds: state.selectedAppIds,
        customPackages: state.customPackages,
        selectedCustomPackageIds: state.selectedCustomPackageIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

// --- Derived Selectors ---

export function useSelectedApps() {
  const selectedAppIds = usePackageStore((state) => state.selectedAppIds);
  const hydrated = usePackageStore((state) => state.hydrated);

  // Return empty set during SSR to prevent hydration mismatch
  if (!hydrated) return new Set<string>();
  return new Set(selectedAppIds);
}

export function useCustomPackages() {
  const customPackages = usePackageStore((state) => state.customPackages);
  const hydrated = usePackageStore((state) => state.hydrated);

  if (!hydrated) return new Map<string, CustomPackage>();
  return new Map(customPackages.map((pkg) => [pkg.token, pkg]));
}

export function useSelectedCustomPackages() {
  const selectedCustomPackageIds = usePackageStore(
    (state) => state.selectedCustomPackageIds,
  );
  const hydrated = usePackageStore((state) => state.hydrated);

  if (!hydrated) return new Set<string>();
  return new Set(selectedCustomPackageIds);
}

export function useSelectedCustomPackagesMap() {
  const customPackages = usePackageStore((state) => state.customPackages);
  const selectedCustomPackageIds = usePackageStore(
    (state) => state.selectedCustomPackageIds,
  );
  const hydrated = usePackageStore((state) => state.hydrated);

  if (!hydrated) return new Map<string, CustomPackage>();

  const selectedSet = new Set(selectedCustomPackageIds);
  const map = new Map<string, CustomPackage>();

  for (const pkg of customPackages) {
    if (selectedSet.has(pkg.token)) {
      map.set(pkg.token, pkg);
    }
  }

  return map;
}

export function useSelectedCount() {
  const selectedAppIds = usePackageStore((state) => state.selectedAppIds);
  const selectedCustomPackageIds = usePackageStore(
    (state) => state.selectedCustomPackageIds,
  );
  const hydrated = usePackageStore((state) => state.hydrated);

  if (!hydrated) return 0;
  return selectedAppIds.length + selectedCustomPackageIds.length;
}

export function useSelectedAppNames() {
  const selectedAppIds = usePackageStore((state) => state.selectedAppIds);
  const hydrated = usePackageStore((state) => state.hydrated);

  if (!hydrated) return [];

  return selectedAppIds
    .map((appId) => APPS.find((app) => app.id === appId)?.brewName)
    .filter((name): name is string => Boolean(name));
}

export function useSelectedTokens() {
  const selectedAppIds = usePackageStore((state) => state.selectedAppIds);
  const selectedCustomPackageIds = usePackageStore(
    (state) => state.selectedCustomPackageIds,
  );
  const hydrated = usePackageStore((state) => state.hydrated);

  if (!hydrated) return new Set<string>();

  const tokens = new Set<string>();

  for (const appId of selectedAppIds) {
    const app = APPS.find((a) => a.id === appId);
    if (app) {
      tokens.add(app.brewName);
    }
  }

  for (const token of selectedCustomPackageIds) {
    tokens.add(token);
  }

  return tokens;
}

export function useBrewCommands() {
  const selectedApps = useSelectedApps();
  const selectedCustomPackagesMap = useSelectedCustomPackagesMap();

  const brewCommand = generateBulkBrewCommand(
    Array.from(selectedApps),
    selectedCustomPackagesMap,
    "install",
  );

  const uninstallCommand = generateBulkBrewCommand(
    Array.from(selectedApps),
    selectedCustomPackagesMap,
    "uninstall",
  );

  return { brewCommand, uninstallCommand };
}

// --- Actions (stable references) ---

export function usePackageActions() {
  return {
    toggleApp: usePackageStore.getState().toggleApp,
    clearApps: usePackageStore.getState().clearApps,
    addCustomPackage: usePackageStore.getState().addCustomPackage,
    removeCustomPackage: usePackageStore.getState().removeCustomPackage,
    toggleCustomPackage: usePackageStore.getState().toggleCustomPackage,
    clearAll: usePackageStore.getState().clearAll,
    initializeFromUrl: usePackageStore.getState().initializeFromUrl,
  };
}
