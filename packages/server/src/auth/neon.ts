import * as jose from "jose";
import { requiredEnv } from "../lib/env";

let jwks: ReturnType<typeof jose.createRemoteJWKSet> | undefined;

function getJwks() {
  if (!jwks) {
    jwks = jose.createRemoteJWKSet(
      new URL(`${requiredEnv("NEON_AUTH_URL")}/.well-known/jwks.json`),
    );
  }
  return jwks;
}

export async function verifyNeonAuthToken(
  token: string,
): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwks(), {
      issuer: new URL(requiredEnv("NEON_AUTH_URL")).origin,
    });
    return payload.sub ? { sub: payload.sub } : null;
  } catch {
    return null;
  }
}
