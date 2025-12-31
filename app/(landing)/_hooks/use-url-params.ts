import { CURATED_APPS } from "@/lib/data/curated-catalogue";
import { lookupPackageTypes } from "../_actions";
import type { HomepageSearchParams } from "../page";

export interface UrlParams {
  kitName: string | undefined;
  kitDescription: string | undefined;
  initialSelectedAppIds: string[];
  initialFullCatalogPackages: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }>;
}

export async function useUrlParams({
  searchParams,
}: {
  searchParams: Promise<HomepageSearchParams>;
}): Promise<UrlParams> {
  const params = await searchParams;
  const kitName = params.name || undefined;
  const kitDescription = params.description || undefined;
  const packagesParam = params.packages || "";

  const packageTokens = packagesParam
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const selectedAppIds: string[] = [];
  const externalTokens: string[] = [];

  for (const token of packageTokens) {
    const app = CURATED_APPS.find(
      (a) => a.id === token || a.brewName === token,
    );
    if (app) {
      selectedAppIds.push(app.id);
    } else if (token) {
      externalTokens.push(token);
    }
  }

  // Lookup actual package types from Homebrew API
  const packageTypesMap = await lookupPackageTypes(externalTokens);

  const initialFullCatalogPackages = externalTokens.map((token) => ({
    token,
    name: token,
    type: packageTypesMap.get(token) || ("cask" as const),
  }));

  return {
    kitName,
    kitDescription,
    initialSelectedAppIds: selectedAppIds,
    initialFullCatalogPackages,
  };
}
