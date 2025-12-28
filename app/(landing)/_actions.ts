"use server";

import Fuse from "fuse.js";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

export type HomebrewPackage = {
  token: string;
  name: string | string[];
  desc: string;
  homepage: string;
  version: string;
  type: "cask" | "formula";
};

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

async function fetchFormulae(): Promise<HomebrewPackage[]> {
  "use cache";
  cacheTag("homebrew-formulae");
  cacheLife("hours");

  const response = await fetch("https://formulae.brew.sh/api/formula.json");
  if (!response.ok) {
    throw new Error("Failed to fetch formulae");
  }

  const data: RawFormula[] = await response.json();

  return data.map((formula) => ({
    token: formula.name,
    name: formula.full_name,
    desc: formula.desc || "",
    homepage: formula.homepage || "",
    version: formula.versions?.stable || "",
    type: "formula" as const,
  }));
}

async function fetchCasks(): Promise<HomebrewPackage[]> {
  "use cache";
  cacheTag("homebrew-casks");
  cacheLife("hours");

  const response = await fetch("https://formulae.brew.sh/api/cask.json");
  if (!response.ok) {
    throw new Error("Failed to fetch casks");
  }

  const data: RawCask[] = await response.json();

  return data.map((cask) => ({
    token: cask.token,
    name: cask.name,
    desc: cask.desc || "",
    homepage: cask.homepage || "",
    version: cask.version || "",
    type: "cask" as const,
  }));
}

async function getCatalogue(): Promise<HomebrewPackage[]> {
  "use cache";
  cacheTag("homebrew-catalogue");
  cacheLife("hours");

  const [formulae, casks] = await Promise.all([fetchFormulae(), fetchCasks()]);
  return [...casks, ...formulae];
}

export type SearchResult = {
  token: string;
  name: string;
  desc: string;
  homepage: string;
  version: string;
  type: "cask" | "formula";
};

export async function searchHomebrewCatalogue(
  query: string,
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const catalogue = await getCatalogue();

  const fuse = new Fuse(catalogue, {
    keys: [
      { name: "token", weight: 0.4 },
      { name: "name", weight: 0.4 },
      { name: "desc", weight: 0.2 },
    ],
    threshold: 0.5,
    ignoreLocation: true,
    includeScore: true,
    useExtendedSearch: true,
    minMatchCharLength: 2,
  });

  const results = fuse.search(query.trim(), { limit: 50 });

  return results.map((result) => ({
    token: result.item.token,
    name: Array.isArray(result.item.name)
      ? result.item.name[0]
      : result.item.name,
    desc: result.item.desc,
    homepage: result.item.homepage,
    version: result.item.version,
    type: result.item.type,
  }));
}
