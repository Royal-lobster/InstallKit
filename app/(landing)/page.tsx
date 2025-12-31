import { HomePageClient } from "./_components/homepage-client";
import { useUrlParams } from "./_hooks/use-url-params";

export interface HomepageSearchParams {
  name?: string;
  packages?: string;
  description?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomepageSearchParams>;
}) {
  // URL parameters - resolved on the server with proper type lookup
  const {
    kitName,
    kitDescription,
    initialSelectedAppIds,
    initialFullCatalogPackages,
  } = await useUrlParams({ searchParams });

  return (
    <HomePageClient
      kitName={kitName}
      kitDescription={kitDescription}
      initialSelectedAppIds={initialSelectedAppIds}
      initialFullCatalogPackages={initialFullCatalogPackages}
    />
  );
}
