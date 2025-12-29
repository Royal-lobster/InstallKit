import { CURATED_APPS } from "@/lib/data/curated-catalogue";
import type { App } from "@/lib/data/schema";

export interface FullCatalogPackage {
  token: string;
  name: string;
  type: "cask" | "formula";
}

export function generateBrewCommand(
  brewName: string,
  type: "cask" | "formula",
  mode: "install" | "uninstall" = "install",
): string {
  const caskFlag = type === "cask" ? "--cask " : "";
  return `brew ${mode} ${caskFlag}${brewName}`;
}

export function generateBulkBrewCommand(
  appIds: string[],
  fullCatalogPackages: Map<string, FullCatalogPackage>,
  mode: "install" | "uninstall" = "install",
): string {
  if (appIds.length === 0 && fullCatalogPackages.size === 0) return "";

  const apps = appIds
    .map((id) => CURATED_APPS.find((app) => app.id === id))
    .filter((app): app is App => app !== undefined);

  const allCasks: string[] = [];
  const allFormulae: string[] = [];

  for (const app of apps) {
    if (app.isCask) {
      allCasks.push(app.brewName);
    } else {
      allFormulae.push(app.brewName);
    }
  }

  for (const pkg of fullCatalogPackages.values()) {
    if (pkg.type === "cask") {
      allCasks.push(pkg.token);
    } else {
      allFormulae.push(pkg.token);
    }
  }

  const commands: string[] = [];
  const verb = mode === "install" ? "install" : "uninstall";

  if (allCasks.length > 0) {
    commands.push(`brew ${verb} --cask ${allCasks.join(" ")}`);
  }

  if (allFormulae.length > 0) {
    commands.push(`brew ${verb} ${allFormulae.join(" ")}`);
  }

  return commands.join(" && ");
}

export function getHomebrewUrl(
  brewName: string,
  type: "cask" | "formula" = "cask",
): string {
  return `https://formulae.brew.sh/${type}/${brewName}`;
}
