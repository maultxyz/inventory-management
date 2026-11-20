import { authClient } from "@/lib/auth/client";
import type { AuthSession } from "@/lib/interfaces/auth";

export async function getAuthSession(): Promise<AuthSession | null> {
  const { data } = await authClient.getSession();
  return (data as { session?: AuthSession } | null)?.session ?? null;
}
