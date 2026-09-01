import * as React from "react";
import { cn } from "../lib/utils";

export type KanbanLane = "todo" | "progress" | "review" | "done";

export interface KanbanColumnProps {
  lane: KanbanLane;
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Drop handlers for HTML5 drag-and-drop. */
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
}

const laneClass: Record<KanbanLane, string> = {
  todo: "kanban-column-todo",
  progress: "kanban-column-progress",
  review: "kanban-column-review",
  done: "kanban-column-done",
};

export function KanbanColumn({
  lane,
  title,
  count,
  action,
  children,
  onDrop,
  className,
}: KanbanColumnProps) {
  const [over, setOver] = React.useState(false);

  return (
    <div
      onDragOver={(e) => {
        if (!onDrop) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        onDrop?.(e);
      }}
      className={cn(
        "kanban-column flex min-h-[240px] w-full flex-col gap-2 rounded-xl p-3 transition-colors",
        laneClass[lane],
        over && "ring-2 ring-accent/60",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
          {typeof count === "number" && (
            <span className="rounded-full bg-background/60 px-1.5 text-[10px] font-semibold text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

export interface TaskCardProps {
  title: string;
  description?: string;
  /** ISO date string; renders overdue styling when in the past and not done. */
  dueDate?: string | null;
  done?: boolean;
  assignee?: { name: string; avatarUrl?: string | null };
  tags?: React.ReactNode;
  footer?: React.ReactNode;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  className?: string;
}

export function TaskCard({
  title,
  description,
  dueDate,
  done,
  assignee,
  tags,
  footer,
  draggable,
  onDragStart,
  onClick,
  className,
}: TaskCardProps) {
  const overdue =
    !done && dueDate ? new Date(dueDate).getTime() < Date.now() : false;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "task-card space-y-2 rounded-xl p-3 text-left",
        overdue && "task-card-overdue",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <p
        className={cn(
          "text-sm font-medium text-foreground",
          done && "text-muted-foreground line-through",
        )}
      >
        {title}
      </p>
      {description && (
        <p className="truncate-2 text-xs text-muted-foreground">{description}</p>
      )}
      {tags && <div className="flex flex-wrap gap-1">{tags}</div>}
      {(dueDate || assignee || footer) && (
        <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
          <span className={cn(overdue && "font-semibold text-status-error")}>
            {dueDate ? new Date(dueDate).toLocaleDateString("sv-SE") : ""}
          </span>
          {assignee && (
            <span className="flex items-center gap-1">
              {assignee.avatarUrl ? (
                <img
                  src={assignee.avatarUrl}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold uppercase text-muted-foreground">
                  {assignee.name.slice(0, 2)}
                </span>
              )}
              {assignee.name}
            </span>
          )}
          {footer}
        </div>
      )}
    </div>
  );
}

export interface KanbanBoardProps {
  children: React.ReactNode;
  className?: string;
}

/** Horizontal scrolling lane container. */
export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return (
    <div
      className={cn(
        "grid gap-3 overflow-x-auto pb-2 sm:grid-flow-col sm:auto-cols-[minmax(260px,1fr)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
