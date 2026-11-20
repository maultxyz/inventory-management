import {
  APP_UPDATE_CHECK_INTERVAL_MS,
  BUILD_VERSION_URL,
  STALE_CHUNK_ERROR_PATTERN,
  STALE_CHUNK_RELOAD_AT_KEY,
  STALE_CHUNK_RELOAD_GUARD_MS,
} from "@/lib/constants/pwa";
import type { BuildVersion } from "@/lib/interfaces/pwa";
import { useSyncExternalStore } from "react";

const updateListeners = new Set<() => void>();
let isAppUpdateAvailable = false;
let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
let hasStartedAppUpdateChecks = false;

function markAppUpdateAvailable() {
  if (isAppUpdateAvailable) return;
  isAppUpdateAvailable = true;
  updateListeners.forEach((listener) => listener());
}

export async function checkForAppUpdate() {
  if (isAppUpdateAvailable || !navigator.onLine) return;
  serviceWorkerRegistration?.update().catch(() => undefined);
  try {
    const response = await fetch(BUILD_VERSION_URL, { cache: "no-store" });
    if (!response.ok) return;
    const { buildId } = (await response.json()) as BuildVersion;
    if (buildId && buildId !== __BUILD_ID__) markAppUpdateAvailable();
  } catch {
    return;
  }
}

export function watchServiceWorkerForUpdates(
  registration: ServiceWorkerRegistration,
) {
  serviceWorkerRegistration = registration;
}

export function startAppUpdateChecks() {
  if (hasStartedAppUpdateChecks) return;
  hasStartedAppUpdateChecks = true;
  const checkWhenVisible = () => {
    if (document.visibilityState === "visible") void checkForAppUpdate();
  };
  document.addEventListener("visibilitychange", checkWhenVisible);
  window.addEventListener("pageshow", checkWhenVisible);
  window.addEventListener("focus", checkWhenVisible);
  window.addEventListener("online", checkWhenVisible);
  setInterval(checkWhenVisible, APP_UPDATE_CHECK_INTERVAL_MS);
  void checkForAppUpdate();
}

export async function hardReload() {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister()),
      );
    }
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }
  } finally {
    window.location.reload();
  }
}

export function isStaleChunkError(error: unknown) {
  return (
    error instanceof Error && STALE_CHUNK_ERROR_PATTERN.test(error.message)
  );
}

export function reloadOnceForStaleChunks() {
  try {
    const lastReloadAt = Number(
      sessionStorage.getItem(STALE_CHUNK_RELOAD_AT_KEY),
    );
    if (Date.now() - lastReloadAt < STALE_CHUNK_RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(STALE_CHUNK_RELOAD_AT_KEY, String(Date.now()));
  } catch {
    return false;
  }
  void hardReload();
  return true;
}

function subscribeToAppUpdate(listener: () => void) {
  updateListeners.add(listener);
  return () => {
    updateListeners.delete(listener);
  };
}

export function useIsAppUpdateAvailable(): boolean {
  return useSyncExternalStore(
    subscribeToAppUpdate,
    () => isAppUpdateAvailable,
    () => false,
  );
}
