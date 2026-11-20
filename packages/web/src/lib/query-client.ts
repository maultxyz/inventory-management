import { APP_QUERY_DEFAULT_OPTIONS } from "@/lib/constants/query";
import { QueryClient } from "@tanstack/react-query";

export const appQueryClient = new QueryClient({
  defaultOptions: APP_QUERY_DEFAULT_OPTIONS,
});
