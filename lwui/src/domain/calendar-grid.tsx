import * as React from "react";
import { cn } from "../lib/utils";

export interface CalendarGridDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
}

export interface CalendarGridProps {
  /** Any date inside the month to render. */
  month: Date;
  /** Renders the contents of a single day cell (events, chips, counts). */
  renderDay?: (day: CalendarGridDay) => React.ReactNode;
  onDayClick?: (date: Date) => void;
  selected?: Date | null;
  weekStartsOn?: 0 | 1;
  locale?: string;
  className?: string;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Month grid used by NAVI resource planning and MARATHON bookings. */
export function CalendarGrid({
  month,
  renderDay,
  onDayClick,
  selected,
  weekStartsOn = 1,
  locale = "sv-SE",
  className,
}: CalendarGridProps) {
  const days = React.useMemo(() => {
    const first = startOfMonth(month);
    const offset = (first.getDay() - weekStartsOn + 7) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - offset);
    const today = new Date();
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      return {
        date,
        inMonth: date.getMonth() === month.getMonth(),
        isToday: isSameDay(date, today),
      };
    });
  }, [month, weekStartsOn]);

  const weekdays = React.useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, 1 + ((i + weekStartsOn + 6) % 7));
      return fmt.format(d);
    });
  }, [locale, weekStartsOn]);

  return (
    <div className={cn("surface-card overflow-hidden", className)}>
      <div className="grid grid-cols-7">
        {weekdays.map((w) => (
          <div
            key={w}
            className="calendar-header px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isSelected = selected ? isSameDay(day.date, selected) : false;
          return (
            <div
              key={day.date.toISOString()}
              onClick={() => onDayClick?.(day.date)}
              role={onDayClick ? "button" : undefined}
              tabIndex={onDayClick ? 0 : undefined}
              className={cn(
                "calendar-cell min-h-[84px] border-t border-border/40 p-1.5 text-left",
                !day.inMonth && "bg-muted/30 text-muted-foreground/50",
                onDayClick && "cursor-pointer hover:bg-muted/40",
                isSelected && "ring-2 ring-inset ring-accent/60",
              )}
            >
              <span
                className={cn(
                  "calendar-day inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  day.isToday && "today bg-accent text-accent-foreground font-semibold",
                )}
              >
                {day.date.getDate()}
              </span>
              <div className="mt-1 space-y-1">{renderDay?.(day)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
