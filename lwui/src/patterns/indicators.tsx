import * as React from "react";
import { Check, CloudOff, Download, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "../primitives/button";
import { cn } from "../lib/utils";

/* ── SaveStatusPill ───────────────────────────────────────── */

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface SaveStatusPillProps {
  status: SaveStatus;
  labels?: Partial<Record<SaveStatus, string>>;
  className?: string;
}

/** Autosave indicator (from the NEBULA calculation grid). */
export function SaveStatusPill({ status, labels, className }: SaveStatusPillProps) {
  if (status === "idle") return null;
  const text =
    labels?.[status] ??
    { saving: "Sparar…", saved: "Sparat", error: "Kunde inte spara", idle: "" }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        status === "saving" && "bg-muted text-muted-foreground",
        status === "saved" && "bg-status-success/15 text-status-success",
        status === "error" && "bg-status-error/15 text-status-error",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === "saved" && <Check className="h-3 w-3" />}
      {status === "error" && <CloudOff className="h-3 w-3" />}
      {text}
    </span>
  );
}

/* ── ConnectionIndicator ──────────────────────────────────── */

export type ConnectionState = "connected" | "connecting" | "disconnected";

export interface ConnectionIndicatorProps {
  state: ConnectionState;
  /** Shows a text label next to the dot. */
  showLabel?: boolean;
  className?: string;
}

/** Realtime connection dot (MARATHON / NAVI headers). */
export function ConnectionIndicator({
  state,
  showLabel = false,
  className,
}: ConnectionIndicatorProps) {
  const map = {
    connected: { dot: "bg-status-success", label: "Ansluten" },
    connecting: { dot: "bg-status-warning animate-pulse", label: "Ansluter…" },
    disconnected: { dot: "bg-status-error", label: "Frånkopplad" },
  }[state];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}
      title={map.label}
    >
      <span className={cn("h-2 w-2 rounded-full", map.dot)} aria-hidden />
      {showLabel && map.label}
      <span className="sr-only">{map.label}</span>
    </span>
  );
}

/* ── Banners ──────────────────────────────────────────────── */

export interface BannerProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function NewVersionBanner({
  message = "En ny version av appen finns tillgänglig.",
  actionLabel = "Uppdatera",
  onAction,
  className,
}: BannerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm",
        className,
      )}
      role="status"
    >
      <span className="flex items-center gap-2 text-foreground">
        <RefreshCw className="h-4 w-4 text-accent" />
        {message}
      </span>
      <Button size="sm" onClick={onAction ?? (() => window.location.reload())}>
        {actionLabel}
      </Button>
    </div>
  );
}

export function OfflineBanner({
  message = "Du är offline. Ändringar sparas när anslutningen återkommer.",
  className,
}: BannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-status-warning/30 bg-status-warning/10 px-4 py-2.5 text-sm text-status-warning",
        className,
      )}
      role="alert"
    >
      <WifiOff className="h-4 w-4" />
      {message}
    </div>
  );
}

export function InstallAppBanner({
  message = "Installera appen på din enhet för snabbare åtkomst.",
  actionLabel = "Installera",
  onAction,
  onDismiss,
  className,
}: BannerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card px-4 py-2.5 text-sm",
        className,
      )}
    >
      <span className="flex items-center gap-2 text-foreground">
        <Download className="h-4 w-4 text-accent" />
        {message}
      </span>
      <div className="flex items-center gap-2">
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Senare
          </Button>
        )}
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
