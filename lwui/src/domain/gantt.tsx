import * as React from "react";
import { cn } from "../lib/utils";

export interface GanttTask {
  id: string;
  label: string;
  start: string | Date;
  end: string | Date;
  /** 0–100 completion. */
  progress?: number;
  tone?: "accent" | "primary" | "success" | "warning" | "error";
}

export interface GanttChartProps {
  tasks: GanttTask[];
  /** Overall window; defaults to min/max of the tasks. */
  rangeStart?: string | Date;
  rangeEnd?: string | Date;
  onTaskClick?: (task: GanttTask) => void;
  labelWidth?: string;
  className?: string;
}

const toneBg: Record<NonNullable<GanttTask["tone"]>, string> = {
  accent: "bg-accent",
  primary: "bg-primary",
  success: "bg-status-success",
  warning: "bg-status-warning",
  error: "bg-status-error",
};

const ms = (d: string | Date) => new Date(d).getTime();

/** Lightweight, dependency-free Gantt row renderer. */
export function GanttChart({
  tasks,
  rangeStart,
  rangeEnd,
  onTaskClick,
  labelWidth = "w-40",
  className,
}: GanttChartProps) {
  const start = rangeStart
    ? ms(rangeStart)
    : Math.min(...tasks.map((t) => ms(t.start)));
  const end = rangeEnd ? ms(rangeEnd) : Math.max(...tasks.map((t) => ms(t.end)));
  const span = Math.max(1, end - start);

  return (
    <div className={cn("space-y-1.5", className)}>
      {tasks.map((task) => {
        const left = ((ms(task.start) - start) / span) * 100;
        const width = Math.max(1, ((ms(task.end) - ms(task.start)) / span) * 100);
        return (
          <div key={task.id} className="flex items-center gap-3">
            <span
              className={cn(
                "shrink-0 truncate text-xs text-muted-foreground",
                labelWidth,
              )}
              title={task.label}
            >
              {task.label}
            </span>
            <div className="relative h-6 flex-1 rounded-md bg-muted/40">
              <button
                type="button"
                onClick={() => onTaskClick?.(task)}
                style={{ left: `${left}%`, width: `${width}%` }}
                className={cn(
                  "gantt-bar absolute inset-y-0 overflow-hidden rounded-md",
                  toneBg[task.tone ?? "accent"],
                  onTaskClick ? "cursor-pointer" : "cursor-default",
                )}
                aria-label={task.label}
              >
                {typeof task.progress === "number" && (
                  <span
                    className="absolute inset-y-0 left-0 bg-foreground/20"
                    style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
                    aria-hidden
                  />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface GanttBarProps {
  progress?: number;
  tone?: NonNullable<GanttTask["tone"]>;
  className?: string;
  children?: React.ReactNode;
}

/** Standalone bar, for custom timeline layouts. */
export function GanttBar({ progress, tone = "accent", className, children }: GanttBarProps) {
  return (
    <div className={cn("gantt-bar relative overflow-hidden rounded-md", toneBg[tone], className)}>
      {typeof progress === "number" && (
        <span
          className="absolute inset-y-0 left-0 bg-foreground/20"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
