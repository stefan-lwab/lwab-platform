import * as React from "react";
import { cn } from "../lib/utils";

export type StatusTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "accent"
  | "requested"
  | "pending"
  | "confirmed"
  | "in-transit"
  | "delivered"
  | "cancelled";

const toneClass: Record<StatusTone, string> = {
  success: "bg-status-success/15 text-status-success border-status-success/30",
  warning: "bg-status-warning/15 text-status-warning border-status-warning/30",
  error: "bg-status-error/15 text-status-error border-status-error/30",
  info: "bg-status-info/15 text-status-info border-status-info/30",
  neutral: "bg-muted text-muted-foreground border-border",
  accent: "bg-accent/15 text-accent border-accent/30",
  requested: "bg-status-requested/15 text-status-requested border-status-requested/30",
  pending: "bg-status-pending/15 text-status-pending border-status-pending/30",
  confirmed: "bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30",
  "in-transit": "bg-status-in-transit/15 text-status-in-transit border-status-in-transit/30",
  delivered: "bg-status-delivered/15 text-status-delivered border-status-delivered/30",
  cancelled: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
};

export interface StatusBadgeProps {
  label: React.ReactNode;
  tone?: StatusTone;
  /** Shows a small leading dot. */
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  label,
  tone = "neutral",
  dot = false,
  size = "sm",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        toneClass[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {label}
    </span>
  );
}

/** Maps arbitrary Swedish/English status strings onto a canonical tone. */
export function statusTone(status?: string | null): StatusTone {
  const s = (status ?? "").toLowerCase();
  if (/klar|godkänd|slutförd|aktiv|completed|approved|done|delivered/.test(s)) return "success";
  if (/pågå|påbörjad|granskas|väntar|pending|review|in.?progress/.test(s)) return "warning";
  if (/avvik|fel|nekad|error|rejected|failed|försenad/.test(s)) return "error";
  if (/planerad|utkast|draft|info|ny\b|new/.test(s)) return "info";
  if (/avbruten|makulerad|cancelled|arkiverad/.test(s)) return "cancelled";
  return "neutral";
}
