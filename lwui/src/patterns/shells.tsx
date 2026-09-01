import * as React from "react";
import { cn } from "../lib/utils";

/* ── SurfaceCard / PremiumCard / AlertCard ────────────────── */

export interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds the gold sheen treatment used on dashboard hero cards. */
  premium?: boolean;
  /** Adds hover elevation. */
  interactive?: boolean;
}

export function SurfaceCard({
  premium,
  interactive,
  className,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        premium ? "premium-card" : "surface-card",
        interactive && "hover-lift cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export type AlertTone = "info" | "success" | "warning" | "error";

const alertTone: Record<AlertTone, string> = {
  info: "border-status-info/30 bg-status-info/10 text-status-info",
  success: "border-status-success/30 bg-status-success/10 text-status-success",
  warning: "border-status-warning/30 bg-status-warning/10 text-status-warning",
  error: "border-status-error/30 bg-status-error/10 text-status-error",
};

export interface AlertCardProps {
  tone?: AlertTone;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function AlertCard({
  tone = "info",
  icon,
  title,
  description,
  action,
  className,
}: AlertCardProps) {
  return (
    <div
      className={cn(
        "alert-card flex items-start gap-3 rounded-xl border p-4",
        alertTone[tone],
        className,
      )}
      role="status"
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── Page / list shells ───────────────────────────────────── */

export interface PageShellProps {
  children: React.ReactNode;
  /** Full-height flex column (for pages that own their own scroll areas). */
  fullHeight?: boolean;
  className?: string;
}

export function PageShell({ children, fullHeight, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6",
        fullHeight && "flex h-full min-h-0 flex-col",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground/80">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Two-pane master/detail layout: stacked on mobile, split at `lg`. */
export interface SplitPaneProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  /** Whether the detail pane is open on mobile. */
  detailOpen?: boolean;
  listWidth?: string;
  className?: string;
}

export function SplitPane({
  list,
  detail,
  detailOpen = false,
  listWidth = "lg:w-[380px]",
  className,
}: SplitPaneProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-4 lg:flex-row", className)}>
      <div
        className={cn(
          "min-h-0 shrink-0 overflow-y-auto lg:block",
          listWidth,
          detailOpen && "hidden",
        )}
      >
        {list}
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto lg:block",
          !detailOpen && "hidden",
        )}
      >
        {detail}
      </div>
    </div>
  );
}
