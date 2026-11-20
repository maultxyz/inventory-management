import type { AppShellProps } from "@/lib/interfaces/app-shell";
import { appQueryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";

export function AppProviders({ children }: AppShellProps) {
  return (
    <QueryClientProvider client={appQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
