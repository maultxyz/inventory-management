import {
  startAppUpdateChecks,
  watchServiceWorkerForUpdates,
} from "@/lib/app-update";
import { registerSW } from "virtual:pwa-register";

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  registerSW({
    immediate: true,
    onRegisteredSW(_serviceWorkerUrl, registration) {
      if (registration) watchServiceWorkerForUpdates(registration);
    },
  });
  startAppUpdateChecks();
}
