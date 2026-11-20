import { AppProviders } from "@/app/providers";
import { AppHotkeys } from "@/components/app-hotkeys";
import { AppNav } from "@/components/app-nav";
import { AppTopBar } from "@/components/app-top-bar";
import { MobileNav } from "@/components/mobile-nav";
import { RouteAnnouncer } from "@/components/route-announcer";
import { RouteLoadingIndicator } from "@/components/route-loading-indicator";
import { SkipLink } from "@/components/skip-link";
import { StatusBar } from "@/components/status-bar";
import { MAIN_CONTENT_ID } from "@/lib/constants/a11y";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <AppProviders>
      <SkipLink />
      <RouteAnnouncer />
      <RouteLoadingIndicator />
      <AppHotkeys />
      <div className="flex h-dvh w-dvw flex-col overflow-hidden bg-sidebar pt-[env(safe-area-inset-top)]">
        <AppTopBar />
        <div className="flex min-h-0 flex-1 flex-row overflow-hidden border-t pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
          <AppNav />
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background outline-none"
          >
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </main>
        </div>
        <StatusBar />
        <MobileNav />
      </div>
    </AppProviders>
  );
}
