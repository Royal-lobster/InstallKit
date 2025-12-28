"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDebounceValue } from "usehooks-ts";
import { type SearchResult, searchHomebrewCatalogue } from "../../_actions";

export const homebrewSearchKeys = {
  all: ["homebrew-search"] as const,
  search: (query: string) => [...homebrewSearchKeys.all, query] as const,
};

export function useHomebrewSearch(query: string) {
  const [debouncedQuery] = useDebounceValue(query, 300);

  const { data, isLoading, error, isFetching } = useQuery<
    SearchResult[],
    Error
  >({
    queryKey: homebrewSearchKeys.search(debouncedQuery),
    queryFn: () => searchHomebrewCatalogue(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Show loading indicator while typing or fetching initial results
  const isSearching =
    query !== debouncedQuery || ((isLoading || isFetching) && !data);

  return useMemo(
    () => ({
      results: data ?? [],
      isSearching,
      error,
      query: debouncedQuery,
    }),
    [data, isSearching, error, debouncedQuery],
  );
}
