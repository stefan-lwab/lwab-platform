import React from "react";
import { usePushNotifications } from "./use-push";

const SNOOZE_KEY = "lwab.push.snoozeUntil";
const SNOOZE_DAYS = 7;
const AUTO_DISMISS_MS = 20_000;

/**
 * Non-blocking coach mark anchored under the notification bell.
 * Shows at most once per 7 days, only while push is still off, auto-dismisses
 * after 20s, and never returns once push is enabled.
 */
export function PushPermissionPrompt({
  vapidPublicKey,
  className = "",
}: {
  vapidPublicKey: string;
  className?: string;
}) {
  const { status, supported, busy, enable } = usePushNotifications({
    vapidPublicKey,
  });
  const [visible, setVisible] = React.useState(false);

  const snooze = React.useCallback(() => {
    try {
      localStorage.setItem(
        SNOOZE_KEY,
        String(Date.now() + SNOOZE_DAYS * 86_400_000),
      );
    } catch {
      /* storage blocked — the prompt simply reappears next session */
    }
    setVisible(false);
  }, []);

  React.useEffect(() => {
    if (!supported || status !== "default") return;
    let until = 0;
    try {
      until = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    } catch {
      /* ignore */
    }
    if (Date.now() < until) return;

    const show = setTimeout(() => {
      setVisible(true);
      // Snooze on show, so it cannot repeat on the next login either.
      try {
        localStorage.setItem(
          SNOOZE_KEY,
          String(Date.now() + SNOOZE_DAYS * 86_400_000),
        );
      } catch {
        /* ignore */
      }
    }, 2500);

    return () => clearTimeout(show);
  }, [supported, status]);

  React.useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible || status === "registered") return null;

  return (
    <div
      role="status"
      className={`absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border/50 bg-popover/95 p-3 shadow-lg backdrop-blur ${className}`}
    >
      <div
        className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-border/50 bg-popover/95"
        aria-hidden
      />
      <p className="text-sm font-medium text-foreground">Slå på notiser</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Få viktiga händelser direkt, även när appen är stängd.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            const ok = await enable();
            if (ok) setVisible(false);
          }}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Aktiverar…" : "Aktivera"}
        </button>
        <button
          type="button"
          onClick={snooze}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border/50 px-3 text-xs text-muted-foreground hover:bg-accent/40"
        >
          Inte nu
        </button>
      </div>
    </div>
  );
}
