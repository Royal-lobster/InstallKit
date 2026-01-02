"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FullCatalogPackage } from "@/lib/helpers/brew-commands";

// --- Types ---

interface FullCatalogPackageInput {
  token: string;
  name: string;
  type: "cask" | "formula";
}

interface PackageSelectionState {
  // State
  selectedAppIds: string[];
  fullCatalogPackages: FullCatalogPackage[];
  selectedFullCatalogPackageIds: string[];
  hydrated: boolean;

  // Actions
  toggleApp: (appId: string) => void;
  clearApps: () => void;
  addFullCatalogPackage: (pkg: FullCatalogPackageInput) => void;
  removeFullCatalogPackage: (token: string, sharedTokens?: Set<string>) => void;
  toggleFullCatalogPackage: (token: string) => void;
  clearAll: (sharedTokens?: Set<string>) => void;
  setHydrated: () => void;
  initializeFromUrl: (
    appIds: string[],
    fullCatalogPkgs: FullCatalogPackageInput[],
  ) => void;
}

// --- Store ---

export const usePackageStore = create<PackageSelectionState>()(
  persist(
    (set) => ({
      // Initial state
      selectedAppIds: [],
      fullCatalogPackages: [],
      selectedFullCatalogPackageIds: [],
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

      addFullCatalogPackage: (pkg: FullCatalogPackageInput) => {
        set((state) => {
          const exists = state.fullCatalogPackages.some(
            (p) => p.token === pkg.token,
          );
          if (exists) return state;
          return {
            fullCatalogPackages: [...state.fullCatalogPackages, pkg],
          };
        });
      },

      removeFullCatalogPackage: (token: string, sharedTokens?: Set<string>) => {
        set((state) => {
          // If it's a shared token (from URL), only deselect, don't remove
          if (sharedTokens?.has(token)) {
            return {
              selectedFullCatalogPackageIds:
                state.selectedFullCatalogPackageIds.filter(
                  (id) => id !== token,
                ),
            };
          }
          // Otherwise, remove the package entirely
          return {
            fullCatalogPackages: state.fullCatalogPackages.filter(
              (pkg) => pkg.token !== token,
            ),
            selectedFullCatalogPackageIds:
              state.selectedFullCatalogPackageIds.filter((id) => id !== token),
          };
        });
      },

      toggleFullCatalogPackage: (token: string) => {
        set((state) => {
          const ids = new Set(state.selectedFullCatalogPackageIds);
          if (ids.has(token)) {
            ids.delete(token);
          } else {
            ids.add(token);
          }
          return { selectedFullCatalogPackageIds: Array.from(ids) };
        });
      },

      clearAll: (sharedTokens?: Set<string>) => {
        set((state) => {
          // Keep shared full catalog packages but deselect them
          const filteredPackages = sharedTokens
            ? state.fullCatalogPackages.filter((pkg) =>
                sharedTokens.has(pkg.token),
              )
            : [];

          return {
            selectedAppIds: [],
            fullCatalogPackages: filteredPackages,
            selectedFullCatalogPackageIds: [],
          };
        });
      },

      setHydrated: () => {
        set({ hydrated: true });
      },

      initializeFromUrl: (
        appIds: string[],
        fullCatalogPkgs: FullCatalogPackageInput[],
      ) => {
        set(() => {
          // Replace existing packages with URL packages instead of merging
          // This ensures clean state when visiting different share URLs
          return {
            selectedAppIds: [...appIds],
            fullCatalogPackages: [...fullCatalogPkgs],
            selectedFullCatalogPackageIds: fullCatalogPkgs.map((p) => p.token),
          };
        });
      },
    }),
    {
      name: "installkit-packages",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAppIds: state.selectedAppIds,
        fullCatalogPackages: state.fullCatalogPackages,
        selectedFullCatalogPackageIds: state.selectedFullCatalogPackageIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
