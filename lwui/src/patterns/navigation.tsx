import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/utils";

/* ── NavItem ──────────────────────────────────────────────── */

export interface NavItemProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
  badge?: React.ReactNode;
  /** Render as a router link: pass your framework's Link via `as`. */
  as?: React.ElementType;
  className?: string;
  [key: string]: unknown;
}

/**
 * Sidebar navigation row. Framework agnostic — pass `as={Link} to="/x"`
 * (react-router) or `as="a" href="/x"`.
 */
export function NavItem({
  icon,
  label,
  active,
  collapsed,
  badge,
  as: Comp = "button",
  className,
  ...rest
}: NavItemProps) {
  return (
    <Comp
      data-active={active ? "true" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "nav-item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
        active ? "active" : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
        collapsed && "justify-center px-2",
        className,
      )}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge && <span className="ml-auto shrink-0">{badge}</span>}
    </Comp>
  );
}

/* ── ThemeToggle ──────────────────────────────────────────── */

export interface ThemeToggleProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  className?: string;
}

/** Controlled theme switch — the app owns persistence. */
export function ThemeToggle({ theme, onThemeChange, className }: ThemeToggleProps) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => onThemeChange(next)}
      aria-label={next === "dark" ? "Aktivera mörkt läge" : "Aktivera ljust läge"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
