"use server";

import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

type RawFormula = {
  name: string;
};

type RawCask = {
  token: string;
};

/**
 * Efficiently fetch only the package names/tokens to determine types.
 * This is much more efficient than fetching full package data.
 */
async function getPackageTokensByType(): Promise<{
  casks: Set<string>;
  formulae: Set<string>;
}> {
  "use cache";
  cacheTag("homebrew-tokens");
  cacheLife("hours");

  const [casksResponse, formulaeResponse] = await Promise.all([
    fetch("https://formulae.brew.sh/api/cask.json"),
    fetch("https://formulae.brew.sh/api/formula.json"),
  ]);

  if (!casksResponse.ok || !formulaeResponse.ok) {
    throw new Error("Failed to fetch package information");
  }

  const [casksData, formulaeData] = await Promise.all([
    casksResponse.json() as Promise<RawCask[]>,
    formulaeResponse.json() as Promise<RawFormula[]>,
  ]);

  return {
    casks: new Set(casksData.map((cask) => cask.token)),
    formulae: new Set(formulaeData.map((formula) => formula.name)),
  };
}

/**
 * Lookup package types for shared links (server-side only).
 * This is needed for SSR when loading shared links with full catalog packages.
 * Now uses a more efficient approach that only fetches tokens instead of full data.
 */
export async function lookupPackageTypes(
  tokens: string[],
): Promise<Map<string, "cask" | "formula">> {
  if (tokens.length === 0) {
    return new Map();
  }

  const { casks, formulae } = await getPackageTokensByType();
  const result = new Map<string, "cask" | "formula">();

  for (const token of tokens) {
    if (casks.has(token)) {
      result.set(token, "cask");
    } else if (formulae.has(token)) {
      result.set(token, "formula");
    }
    // If token is not found in either, we don't add it to the result
    // The calling code will default to "cask" if needed
  }

  return result;
}
