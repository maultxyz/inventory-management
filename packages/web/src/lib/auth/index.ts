import { authClient } from "@/lib/auth/client";

export const useAuthSession = () => authClient.useSession();

export async function signOut(): Promise<void> {
  await authClient.signOut();
}
