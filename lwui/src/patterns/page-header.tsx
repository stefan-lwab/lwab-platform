import * as React from "react";
import { cn } from "../lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional icon rendered in a gold-tinted tile to the left of the title. */
  icon?: React.ReactNode;
  /** Right-aligned actions (buttons, filters). */
  actions?: React.ReactNode;
  /** Breadcrumb or back-link slot rendered above the title. */
  eyebrow?: React.ReactNode;
  className?: string;
}

/**
 * Canonical page header for every LWAB app.
 * Replaces the per-app PageHeader / SectionHeader / WelcomeHero variants.
 */
export function PageHeader({
  title,
  description,
  icon,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "page-header flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <span className="bg-accent/15 text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
      )}
    </header>
  );
}

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground/80">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
