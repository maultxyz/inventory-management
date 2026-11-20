import { ApiStatusError } from "@/lib/api/api-status-error";
import { signOut } from "@/lib/auth";
import { getAuthSession } from "@/lib/auth/session";
import { signInPathReturningTo } from "@/lib/auth-redirect";
import { API_BASE } from "@/lib/constants/api";

export async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getAuthSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

let unauthorizedHandled = false;

async function handleUnauthorized(res: Response): Promise<void> {
  if (res.status !== 401) return;
  if (!unauthorizedHandled) {
    unauthorizedHandled = true;
    await signOut().catch(() => undefined);
    window.location.href = signInPathReturningTo(
      window.location.pathname + window.location.search,
    );
  }
  throw new ApiStatusError(401);
}

async function checkResponse(res: Response): Promise<void> {
  await handleUnauthorized(res);
  if (!res.ok) throw new ApiStatusError(res.status);
}

async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(await getAuthHeaders()),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  await checkResponse(res);
  return res.json();
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>("GET", path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>("POST", path, body);
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>("PUT", path, body);
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>("DELETE", path);
}
