import { BrandMark } from "@/components/brand-mark";
import { authClient } from "@/lib/auth/client";
import { safeAuthRedirectPath } from "@/lib/auth-redirect";
import { MAIN_CONTENT_ID } from "@/lib/constants/a11y";
import { AUTH_REDIRECT_PARAM } from "@/lib/constants/auth";
import { AUTH_VIEW_CLASS_NAMES } from "@/lib/constants/auth-view";
import { HOME_PATH } from "@/lib/constants/nav";
import {
  AuthView,
  NeonAuthUIProvider,
} from "@neondatabase/neon-js/auth/react/ui";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router-dom";

export default function AuthPage() {
  const { t } = useTranslation("auth");
  const { path } = useParams();
  const [searchParams] = useSearchParams();
  const redirectTo =
    safeAuthRedirectPath(searchParams.get(AUTH_REDIRECT_PARAM)) ?? HOME_PATH;
  const headingKey =
    path === "sign-up"
      ? "signUpTitle"
      : path === "forgot-password"
        ? "forgotPasswordTitle"
        : path === "reset-password"
          ? "resetPasswordTitle"
          : "signInTitle";

  return (
    <NeonAuthUIProvider
      defaultTheme="system"
      authClient={authClient}
      baseURL={window.location.origin}
      redirectTo={redirectTo}
    >
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="bg-background flex min-h-dvh flex-col items-center justify-center gap-6 p-4 outline-none"
      >
        <h1 className="sr-only">{t(headingKey)}</h1>
        <BrandMark />
        <AuthView path={path} classNames={AUTH_VIEW_CLASS_NAMES} />
      </main>
    </NeonAuthUIProvider>
  );
}
