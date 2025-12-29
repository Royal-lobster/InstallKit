import { Index } from "flexsearch";
import type { HomebrewPackage } from "./db";

export type SearchResult = {
  token: string;
  name: string;
  desc: string;
  homepage: string;
  version: string;
  type: "cask" | "formula";
};

// Simple FlexSearch indexes for each field
let tokenIndex: Index | null = null;
let nameIndex: Index | null = null;
let descIndex: Index | null = null;
const indexedPackages: Map<string, HomebrewPackage> = new Map();
const packageList: HomebrewPackage[] = [];

export function createSearchIndex(packages: HomebrewPackage[]): void {
  // Clear existing indexes to prevent memory leaks
  clearIndex();
  
  // Create separate indexes for each field with smaller cache to save memory
  tokenIndex = new Index({
    tokenize: "forward",
    resolution: 7, // Reduced from 9
    cache: 50,     // Reduced from 100
  });

  nameIndex = new Index({
    tokenize: "forward", 
    resolution: 7, // Reduced from 9
    cache: 50,     // Reduced from 100
  });

  descIndex = new Index({
    tokenize: "forward",
    resolution: 5,
    cache: 25,     // Reduced from 100
  });

  // Index all packages
  indexedPackages.clear();
  packageList.length = 0; // More memory efficient than reassigning

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const normalizedPkg = {
      ...pkg,
      name: Array.isArray(pkg.name) ? pkg.name[0] : pkg.name,
    };

    tokenIndex.add(i, pkg.token);
    nameIndex.add(i, normalizedPkg.name);
    if (pkg.desc) {
      descIndex.add(i, pkg.desc);
    }

    indexedPackages.set(pkg.token, normalizedPkg);
    packageList.push(normalizedPkg);
  }
}

export function searchPackages(
  query: string,
  limit: number = 50,
): SearchResult[] {
  if (
    !tokenIndex ||
    !nameIndex ||
    !descIndex ||
    !query ||
    query.trim().length < 2
  ) {
    return [];
  }

  const trimmedQuery = query.trim().toLowerCase();

  // Search each field with smaller limits to reduce memory usage
  const searchLimit = Math.min(limit * 2, 200); // Cap at 200 results max
  const tokenResults = tokenIndex.search(trimmedQuery, {
    limit: searchLimit,
  }) as number[];
  const nameResults = nameIndex.search(trimmedQuery, {
    limit: searchLimit,
  }) as number[];
  const descResults = descIndex.search(trimmedQuery, { 
    limit: Math.min(limit, 100) // Cap desc results
  }) as number[];

  // Collect unique results with scores
  const scoreMap = new Map<number, number>();

  // Token matches get highest weight
  for (let i = 0; i < tokenResults.length; i++) {
    const idx = tokenResults[i];
    const positionScore = (limit * 2 - i) / (limit * 2);
    scoreMap.set(idx, (scoreMap.get(idx) || 0) + 3 * positionScore);
  }

  // Name matches get medium weight
  for (let i = 0; i < nameResults.length; i++) {
    const idx = nameResults[i];
    const positionScore = (limit * 2 - i) / (limit * 2);
    scoreMap.set(idx, (scoreMap.get(idx) || 0) + 2 * positionScore);
  }

  // Desc matches get lowest weight
  for (let i = 0; i < descResults.length; i++) {
    const idx = descResults[i];
    const positionScore = (limit - i) / limit;
    scoreMap.set(idx, (scoreMap.get(idx) || 0) + 1 * positionScore);
  }

  // Convert to array and add boost for exact/prefix matches
  const scoredResults: { pkg: HomebrewPackage; score: number }[] = [];

  for (const [idx, score] of scoreMap) {
    const pkg = packageList[idx];
    if (!pkg) continue;

    // Boost exact token matches
    const exactBoost = pkg.token.toLowerCase() === trimmedQuery ? 10 : 0;
    const startsWithBoost = pkg.token.toLowerCase().startsWith(trimmedQuery)
      ? 5
      : 0;

    scoredResults.push({
      pkg,
      score: score + exactBoost + startsWithBoost,
    });
  }

  // Sort by score and return top results
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.slice(0, limit).map(({ pkg }) => ({
    token: pkg.token,
    name: typeof pkg.name === "string" ? pkg.name : pkg.name,
    desc: pkg.desc,
    homepage: pkg.homepage,
    version: pkg.version,
    type: pkg.type,
  }));
}

export function isIndexReady(): boolean {
  return tokenIndex !== null && indexedPackages.size > 0;
}

export function getPackageFromIndex(
  token: string,
): HomebrewPackage | undefined {
  return indexedPackages.get(token);
}

export function clearIndex(): void {
  // Properly dispose of FlexSearch indexes
  if (tokenIndex) {
    tokenIndex.clear();
    tokenIndex = null;
  }
  if (nameIndex) {
    nameIndex.clear();
    nameIndex = null;
  }
  if (descIndex) {
    descIndex.clear();
    descIndex = null;
  }
  
  indexedPackages.clear();
  packageList.length = 0; // More memory efficient
}
