import * as React from "react";
import { Filter, X } from "lucide-react";
import { Badge } from "../primitives/badge";
import { Button } from "../primitives/button";
import { Checkbox } from "../primitives/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../primitives/popover";
import { cn } from "../lib/utils";

export interface FilterSubgroup {
  label: string;
  options: string[];
}

export interface FilterGroup {
  key: string;
  label: string;
  options: string[];
  subcategories?: FilterSubgroup[];
}

export type ActiveFilters = Record<string, string[]>;

export interface FilterToolbarProps {
  groups: FilterGroup[];
  filters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  clearLabel?: string;
  className?: string;
}

/** Multi-group checkbox filter bar (from ATLANTIS, generalised). */
export function FilterToolbar({
  groups,
  filters,
  onFiltersChange,
  clearLabel = "Rensa filter",
  className,
}: FilterToolbarProps) {
  const toggle = (groupKey: string, option: string) => {
    const current = filters[groupKey] ?? [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    if (updated.length === 0) {
      const next = { ...filters };
      delete next[groupKey];
      onFiltersChange(next);
    } else {
      onFiltersChange({ ...filters, [groupKey]: updated });
    }
  };

  const activeCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  const renderOptions = (groupKey: string, options: string[], selected: string[]) =>
    options.map((option) => (
      <label
        key={option}
        className="flex cursor-pointer items-center gap-2 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Checkbox
          checked={selected.includes(option)}
          onCheckedChange={() => toggle(groupKey, option)}
        />
        {option}
      </label>
    ));

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
      {groups.map((group) => {
        const selected = filters[group.key] ?? [];
        const isActive = selected.length > 0;
        return (
          <Popover key={group.key}>
            <PopoverTrigger asChild>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                {group.label}
                {isActive && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-4 min-w-4 justify-center px-1 text-[10px]"
                  >
                    {selected.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <p className="mb-2 text-xs font-medium text-foreground">{group.label}</p>
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {group.options.length > 0 && (
                  <div className="space-y-1.5">
                    {renderOptions(group.key, group.options, selected)}
                  </div>
                )}
                {group.subcategories?.map((sub) => (
                  <div key={sub.label} className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                      {sub.label}
                    </p>
                    {renderOptions(group.key, sub.options, selected)}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}

      {activeCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({})}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          {clearLabel} ({activeCount})
        </Button>
      )}
    </div>
  );
}
