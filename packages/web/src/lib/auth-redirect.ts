import { AUTH_REDIRECT_PARAM, SIGN_IN_PATH } from "@/lib/constants/auth";

export function safeAuthRedirectPath(
  value: string | null | undefined,
): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return null;
  }
  return value;
}

export function signInPathReturningTo(returnPath: string): string {
  const safeReturnPath = safeAuthRedirectPath(returnPath);
  if (!safeReturnPath) return SIGN_IN_PATH;
  return `${SIGN_IN_PATH}?${new URLSearchParams({ [AUTH_REDIRECT_PARAM]: safeReturnPath })}`;
}
