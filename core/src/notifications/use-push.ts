import { useCallback, useEffect, useState } from "react";
import { useLwab } from "../config";
import { callJarvisFunction } from "../api/app-config";

export type PushStatus =
  | "unsupported"
  | "denied"
  | "default"
  | "granted"
  | "registered";

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buffer;
}

/**
 * Web Push registration, scoped to THIS app_code.
 * Scoping matters: Novu is centralised, so an unscoped device would receive a
 * push from every PWA in the ecosystem. novu-push-webhook only delivers to
 * devices registered for the emitting app.
 */
export function usePushNotifications(options: { vapidPublicKey: string }) {
  const cfg = useLwab();
  const [status, setStatus] = useState<PushStatus>("default");
  const [busy, setBusy] = useState(false);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  useEffect(() => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") return setStatus("denied");
    if (perm !== "granted") return setStatus("default");

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "registered" : "granted"))
      .catch(() => setStatus("granted"));
  }, [supported]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "default");
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(options.vapidPublicKey),
        }));

      const { error } = await callJarvisFunction(cfg, "novu-push-register", {
        app_code: cfg.appCode,
        subscription: sub.toJSON(),
        user_agent: navigator.userAgent,
      });

      if (error) {
        if (cfg.debug !== false) {
          console.warn(`[lwab-core] push registration failed: ${error}`);
        }
        return false;
      }

      setStatus("registered");
      return true;
    } finally {
      setBusy(false);
    }
  }, [cfg, options.vapidPublicKey, supported]);

  const disable = useCallback(async () => {
    if (!supported) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await callJarvisFunction(cfg, "novu-push-register", {
      app_code: cfg.appCode,
      unregister: true,
      endpoint: sub.endpoint,
    });
    await sub.unsubscribe();
    setStatus("granted");
  }, [cfg, supported]);

  return { status, supported, busy, enable, disable };
}
