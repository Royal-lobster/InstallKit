import { APPS } from "@/lib/data/apps";
import { CATEGORIES } from "@/lib/schema";
import { lookupPackageTypes } from "./_actions";
import { BrewPicker } from "./_components/brew-picker";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const kitName = typeof params.name === "string" ? params.name : undefined;
  const kitDescription =
    typeof params.description === "string" ? params.description : undefined;
  const packagesParam =
    typeof params.packages === "string" ? params.packages : "";

  const packageTokens = packagesParam
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const selectedAppIds: string[] = [];
  const externalTokens: string[] = [];

  // First pass: identify which packages are in our curated list
  for (const token of packageTokens) {
    const app = APPS.find((a) => a.id === token || a.brewName === token);
    if (app) {
      selectedAppIds.push(app.id);
    } else if (token) {
      externalTokens.push(token);
    }
  }

  // Only fetch Homebrew catalogue if there are external packages
  const packageTypes =
    externalTokens.length > 0
      ? await lookupPackageTypes(externalTokens)
      : new Map<string, "cask" | "formula">();

  const customPackages: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }> = externalTokens.map((token) => ({
    token,
    name: token,
    type: packageTypes.get(token) || "cask", // Default to cask if not found
  }));

  return (
    <BrewPicker
      apps={APPS}
      categories={CATEGORIES}
      kitName={kitName}
      kitDescription={kitDescription}
      initialSelectedAppIds={selectedAppIds}
      initialCustomPackages={customPackages}
    />
  );
}
