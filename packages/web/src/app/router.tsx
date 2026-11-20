import ErrorPage from "@/app/routes/error";
import NotFoundPage from "@/app/routes/not-found";
import { AppLoadingScreen } from "@/components/app-loading-screen";
import {
  ACTIVITY_PATH,
  HOME_PATH,
  ITEMS_PATH,
  SCAN_PATH,
} from "@/lib/constants/nav";
import { lazyRoute, registerPreloadableRoutes } from "@/lib/route-chunks";
import { Suspense } from "react";
import { Navigate, Outlet, type RouteObject } from "react-router-dom";

const AuthGuard = lazyRoute(() => import("@/app/routes/auth-guard"));
const AuthPage = lazyRoute(() => import("@/app/routes/auth"));
const AppLayout = lazyRoute(() => import("@/app/routes/app/layout"));
const HomePage = lazyRoute(() => import("@/app/routes/app/home"));
const ItemsPage = lazyRoute(() => import("@/app/routes/app/items"));
const ScanPage = lazyRoute(() => import("@/app/routes/app/scan"));
const ActivityPage = lazyRoute(() => import("@/app/routes/app/activity"));

function RootLayout() {
  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Navigate to={HOME_PATH} replace /> },
      { path: "/auth/:path", element: <AuthPage /> },
      {
        path: "/app",
        element: <AuthGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to={HOME_PATH} replace /> },
              { path: HOME_PATH, element: <HomePage /> },
              { path: SCAN_PATH, element: <ScanPage /> },
              { path: ITEMS_PATH, element: <ItemsPage /> },
              { path: ACTIVITY_PATH, element: <ActivityPage /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

registerPreloadableRoutes(routes);
