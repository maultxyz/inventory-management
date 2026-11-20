import { AppShell } from "@/app/app-shell";
import { routes } from "@/app/router";
import "@/index.css";
import "@/lib/i18n";
import { registerServiceWorker } from "@/lib/pwa";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter(routes);

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppShell>
      <RouterProvider router={router} />
    </AppShell>
  </StrictMode>,
);
