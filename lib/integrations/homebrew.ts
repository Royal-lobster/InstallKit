import axios from "axios";

export const homebrewApi = axios.create({
  baseURL: "https://formulae.brew.sh/api",
  timeout: 10000,
});

export type HomebrewInfo = {
  name?: string;
  description?: string;
  homepage?: string;
  version?: string;
  url?: string;
  kind: "cask" | "formula";
};

type HomebrewEndpoint = {
  path: string;
  kind: HomebrewInfo["kind"];
  pageUrl: string;
};

function getEndpoints(brewName: string): Array<HomebrewEndpoint> {
  return [
    {
      path: `/cask/${brewName}.json`,
      kind: "cask",
      pageUrl: `https://formulae.brew.sh/cask/${brewName}`,
    },
    {
      path: `/formula/${brewName}.json`,
      kind: "formula",
      pageUrl: `https://formulae.brew.sh/formula/${brewName}`,
    },
  ];
}

function parseVersion(data: Record<string, unknown>): string | undefined {
  if (typeof data.version === "string") {
    return data.version;
  }
  const versions = data.versions as Record<string, unknown> | undefined;
  if (typeof versions?.stable === "string") {
    return versions.stable;
  }
  return undefined;
}

function parseName(data: Record<string, unknown>): string | undefined {
  const name = data.name;
  return Array.isArray(name) ? name[0] : (name as string | undefined);
}

export async function fetchHomebrewInfo(
  brewName: string,
): Promise<HomebrewInfo> {
  const endpoints = getEndpoints(brewName);

  for (const endpoint of endpoints) {
    try {
      const { data } = await homebrewApi.get<Record<string, unknown>>(
        endpoint.path,
      );

      return {
        name: parseName(data),
        description: (data.desc ?? data.description) as string | undefined,
        homepage: (data.homepage ?? data.url) as string | undefined,
        version: parseVersion(data),
        url: endpoint.pageUrl,
        kind: endpoint.kind,
      };
    } catch {}
  }

  throw new Error("No Homebrew metadata available");
}
