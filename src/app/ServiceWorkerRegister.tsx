"use client";

import { useEffect } from "react";

/** Registers `public/sw.js`, which keeps the crisis page available offline. Production only, so dev isn't served stale caches. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Offline support is best-effort; the app works without it.
    });
  }, []);
  return null;
}
