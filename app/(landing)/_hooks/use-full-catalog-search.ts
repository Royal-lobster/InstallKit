"use client";

import { useMemo } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useFullCatalog } from "@/app/(landing)/_hooks/use-full-catalog";

export function useFullCatalogSearch(query: string) {
  const [debouncedQuery] = useDebounceValue(query, 150); // Faster debounce for client-side search
  const { search, isReady, isLoading, error } = useFullCatalog();

  const results = useMemo(() => {
    if (!isReady || debouncedQuery.trim().length < 2) {
      return [];
    }
    return search(debouncedQuery, 50);
  }, [debouncedQuery, isReady, search]);

  // Show loading indicator while:
  // 1. Typing (query doesn't match debounced yet)
  // 2. Catalog is still loading initially
  const isSearching = query !== debouncedQuery || (isLoading && !isReady);

  return useMemo(
    () => ({
      results,
      isSearching,
      isCatalogReady: isReady,
      error,
      query: debouncedQuery,
    }),
    [results, isSearching, isReady, error, debouncedQuery],
  );
}
