import { runtimeEnv } from "@/lib/runtime-env";
import { createAuthClient } from "@neondatabase/neon-js/auth";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

const neonAuthUrl = runtimeEnv("VITE_NEON_AUTH_URL");

if (!neonAuthUrl) {
  throw new Error(
    "VITE_NEON_AUTH_URL is not set. Copy .env.example to .env and fill in the Neon values.",
  );
}

export const authClient = createAuthClient(neonAuthUrl, {
  adapter: BetterAuthReactAdapter(),
});
