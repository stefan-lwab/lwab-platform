import * as React from "react";
import { cn } from "../lib/utils";

export type WorkPassColor =
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "gray";

export interface WorkPassChipProps {
  label: React.ReactNode;
  color?: WorkPassColor;
  /** Optional secondary line, e.g. shift hours. */
  detail?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Shift / work-pass chip used in resource planning (NAVI, MARATHON). */
export function WorkPassChip({
  label,
  color = "gray",
  detail,
  onClick,
  className,
}: WorkPassChipProps) {
  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "work-pass inline-flex w-full items-center justify-between gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        `work-pass-${color}`,
        onClick && "cursor-pointer",
        className,
      )}
    >
      <span className="truncate">{label}</span>
      {detail && <span className="shrink-0 opacity-80">{detail}</span>}
    </span>
  );
}
