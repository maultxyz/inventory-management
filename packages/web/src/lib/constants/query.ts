import type { DefaultOptions } from "@tanstack/react-query";

export const QUERY_STALE_MS = 30_000;
export const INACTIVE_QUERY_CACHE_MS = 15 * 60_000;

export const APP_QUERY_DEFAULT_OPTIONS: DefaultOptions = {
  queries: {
    staleTime: QUERY_STALE_MS,
    gcTime: INACTIVE_QUERY_CACHE_MS,
    retry: 1,
  },
};
