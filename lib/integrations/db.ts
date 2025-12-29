import { type DBSchema, type IDBPDatabase, openDB } from "idb";

export type HomebrewPackage = {
  token: string;
  name: string;
  desc: string;
  homepage: string;
  version: string;
  type: "cask" | "formula";
};

interface HomebrewCatalogDB extends DBSchema {
  packages: {
    key: string;
    value: HomebrewPackage;
    indexes: {
      "by-type": "cask" | "formula";
    };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: string | number;
    };
  };
}

const DB_NAME = "homebrew-catalog";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<HomebrewCatalogDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<HomebrewCatalogDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<HomebrewCatalogDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Packages store
      if (!db.objectStoreNames.contains("packages")) {
        const packageStore = db.createObjectStore("packages", {
          keyPath: "token",
        });
        packageStore.createIndex("by-type", "type");
      }

      // Metadata store (for timestamps, etc.)
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata", { keyPath: "key" });
      }
    },
  });

  return dbInstance;
}

export async function savePackages(packages: HomebrewPackage[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["packages", "metadata"], "readwrite");

  // Clear existing packages and add new ones
  await tx.objectStore("packages").clear();

  for (const pkg of packages) {
    await tx.objectStore("packages").put(pkg);
  }

  // Update timestamp
  await tx.objectStore("metadata").put({
    key: "lastUpdated",
    value: Date.now(),
  });

  await tx.done;
}

export async function getAllPackages(): Promise<HomebrewPackage[]> {
  const db = await getDB();
  return db.getAll("packages");
}

export async function getPackageByToken(
  token: string,
): Promise<HomebrewPackage | undefined> {
  const db = await getDB();
  return db.get("packages", token);
}

export async function getLastUpdated(): Promise<number | null> {
  const db = await getDB();
  const metadata = await db.get("metadata", "lastUpdated");
  return metadata ? (metadata.value as number) : null;
}

export async function hasPackages(): Promise<boolean> {
  const db = await getDB();
  const count = await db.count("packages");
  return count > 0;
}
