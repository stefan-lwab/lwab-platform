import * as React from "react";
import { ArrowDownRight, ArrowUpRight, ArrowUpRight as LinkArrow, Minus } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Canonical KPI tile — MARATHON's KpiCard, tokenised.
 *
 * Every tone resolves to a design token (`--tone-*`), so a single token
 * edit restyles every card in every app. No raw palette colours.
 */
export type StatTone =
  | "gold"
  | "teal"
  | "violet"
  | "emerald"
  | "blue"
  | "amber"
  /* legacy aliases kept so existing call sites keep compiling */
  | "default"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info";

const TONE_VAR: Record<StatTone, string> = {
  gold: "--tone-gold",
  teal: "--tone-teal",
  violet: "--tone-violet",
  emerald: "--tone-emerald",
  blue: "--tone-blue",
  amber: "--tone-amber",
  default: "--muted-foreground",
  primary: "--primary",
  accent: "--tone-gold",
  success: "--status-success",
  warning: "--status-warning",
  error: "--status-error",
  info: "--status-info",
};

export interface StatCardProps {
  /** Uppercase label under the icon. */
  title: string;
  value: React.ReactNode;
  /** Secondary line, shown when there is no progress bar or delta. */
  subtitle?: string;
  /** Alias of `subtitle` (MARATHON naming). */
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTone;
  /** Percentage delta vs previous period. */
  trend?: { value: number; positive?: boolean };
  /** Sparkline series, newest last. */
  sparkline?: number[];
  /** 0–100 progress bar. */
  progress?: number;
  progressLabel?: string;
  /** `hairline` swaps the tone wash for NAVI's coloured top rule. */
  variant?: "wash" | "hairline";
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  hint,
  icon,
  tone = "gold",
  trend,
  sparkline,
  progress,
  progressLabel,
  variant = "wash",
  loading,
  onClick,
  className,
}: StatCardProps) {
  const interactive = Boolean(onClick);
  const toneVar = TONE_VAR[tone];
  const toneColor = `hsl(var(${toneVar}))`;
  const toneAlpha = (a: number) => `hsl(var(${toneVar}) / ${a})`;
  const positive = trend ? (trend.positive ?? trend.value > 0) : false;
  const footer = hint ?? subtitle;

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5",
        "backdrop-blur-xl transition-all duration-300",
        "hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover",
        interactive &&
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {variant === "wash" ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${toneAlpha(0.2)}, ${toneAlpha(0.08)}, transparent)`,
          }}
        />
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{ background: toneColor }}
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-foreground/5 blur-2xl"
      />

      <div className="relative flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          {icon && (
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/40 ring-1 backdrop-blur"
              style={{
                color: toneColor,
                boxShadow: `inset 0 0 0 1px ${toneAlpha(0.3)}`,
              }}
            >
              {icon}
            </span>
          )}
          {interactive && (
            <LinkArrow className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>

        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </div>

        <div className="flex items-end justify-between gap-3">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : (
            <div className="text-[2.25rem] font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </div>
          )}
          {sparkline && sparkline.length > 1 && (
            <Sparkline values={sparkline} color={toneColor} />
          )}
        </div>

        {progress !== undefined && (
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, progress))}%`,
                  background: `linear-gradient(to right, ${toneColor}, ${toneAlpha(0.6)})`,
                }}
              />
            </div>
            {progressLabel && (
              <div className="mt-1.5 text-[10px] font-medium text-muted-foreground">
                {progressLabel}
              </div>
            )}
          </div>
        )}

        {trend && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
                trend.value === 0
                  ? "bg-muted text-muted-foreground"
                  : positive
                    ? "bg-status-success/15 text-status-success"
                    : "bg-destructive/15 text-destructive",
              )}
            >
              {trend.value === 0 ? (
                <Minus className="h-3 w-3" />
              ) : positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {positive && trend.value !== 0 ? "+" : ""}
              {trend.value}%
            </span>
          </div>
        )}

        {footer && progress === undefined && !trend && (
          <div className="text-xs text-muted-foreground">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function Sparkline({
  values,
  color = "currentColor",
  className,
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  const max = Math.max(1, ...values);
  const w = 90;
  const h = 36;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values.map((v, i) => [i * step, h - (v / max) * (h - 4) - 2] as const);
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
  const gid = React.useId().replace(/[:]/g, "");

  return (
    <svg
      width={w}
      height={h}
      className={cn("shrink-0 overflow-visible", className)}
      style={{ color }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gid})`} />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="2.5"
          fill="currentColor"
        />
      )}
    </svg>
  );
}
