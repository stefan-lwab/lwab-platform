import * as React from "react";
import { AlertTriangle, Inbox, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "../primitives/button";
import { Skeleton } from "../primitives/skeleton";
import { cn } from "../lib/utils";

/* ── EmptyState ───────────────────────────────────────────── */

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ── LoadingState ─────────────────────────────────────────── */

export interface LoadingStateProps {
  isLoading: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
}

export function LoadingState({
  isLoading,
  error,
  errorMessage = "Kunde inte hämta data",
  onRetry,
  skeleton,
  children,
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <>
        {skeleton ?? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p className="text-sm text-destructive">{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Försök igen
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

/* ── ErrorState ───────────────────────────────────────────── */

export type ErrorKind = "permission" | "runtime" | "network" | "notfound";

export interface ErrorStateProps {
  /** Distinguishes "you lack access" from "the code broke" — mirrors the ecosystem error classifier. */
  kind?: ErrorKind;
  title?: string;
  description?: string;
  /** Rendered under the message — e.g. a RequestAccessButton for `permission`. */
  action?: React.ReactNode;
  traceId?: string;
  className?: string;
}

const errorDefaults: Record<ErrorKind, { title: string; description: string }> = {
  permission: {
    title: "Åtkomst krävs",
    description: "Du saknar behörighet till den här vyn. Begär åtkomst så meddelas administratören.",
  },
  runtime: {
    title: "Något gick fel",
    description: "Ett tekniskt fel uppstod. Felet har loggats och granskas.",
  },
  network: {
    title: "Ingen anslutning",
    description: "Kunde inte nå servern. Kontrollera din uppkoppling och försök igen.",
  },
  notfound: {
    title: "Hittades inte",
    description: "Sidan eller posten finns inte längre.",
  },
};

export function ErrorState({
  kind = "runtime",
  title,
  description,
  action,
  traceId,
  className,
}: ErrorStateProps) {
  const fallback = errorDefaults[kind];
  return (
    <div
      className={cn(
        "alert-card flex flex-col items-center gap-3 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          kind === "permission"
            ? "bg-status-warning/15 text-status-warning"
            : "bg-destructive/15 text-destructive",
        )}
      >
        {kind === "permission" ? (
          <ShieldAlert className="h-5 w-5" />
        ) : (
          <AlertTriangle className="h-5 w-5" />
        )}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title ?? fallback.title}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {description ?? fallback.description}
        </p>
      </div>
      {action}
      {traceId && (
        <code className="text-[10px] text-muted-foreground/70">trace: {traceId}</code>
      )}
    </div>
  );
}

/* ── Skeletons ────────────────────────────────────────────── */

export function ListSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ cards = 4, className }: { cards?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}
