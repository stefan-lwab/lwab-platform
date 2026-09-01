import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { Button } from "../primitives/button";
import { Input } from "../primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../primitives/select";
import { cn } from "../lib/utils";
import { EmptyState } from "./states";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  searchValue?: (row: T) => string;
  className?: string;
  /** Hidden below `sm` unless `mobileHorizontalScroll` is set. */
  hideMobile?: boolean;
  align?: "left" | "right" | "center";
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSizes?: number[];
  defaultPageSize?: number;
  /** Extra controls rendered next to the search field. */
  toolbar?: React.ReactNode;
  emptyState?: React.ReactNode;
  mobileHorizontalScroll?: boolean;
  className?: string;
}

type SortDir = "asc" | "desc" | null;

/**
 * Sortable, searchable, paginated table.
 * Consolidated from the FENIX DataTable + ATLANTIS DataTablePagination.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  rowClassName,
  searchable = true,
  searchPlaceholder = "Sök...",
  pageSizes = [10, 25, 50, 100],
  defaultPageSize = 25,
  toolbar,
  emptyState,
  mobileHorizontalScroll = false,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>(null);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  const searched = React.useMemo(() => {
    if (!search || search.length < 2) return data;
    const s = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const txt = col.searchValue
          ? col.searchValue(row)
          : String((row as Record<string, unknown>)[col.key] ?? "");
        return txt.toLowerCase().includes(s);
      }),
    );
  }, [data, search, columns]);

  const sorted = React.useMemo(() => {
    if (!sortKey || !sortDir) return searched;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return searched;
    return [...searched].sort((a, b) => {
      const av = col.sortValue
        ? col.sortValue(a)
        : String((a as Record<string, unknown>)[col.key] ?? "");
      const bv = col.sortValue
        ? col.sortValue(b)
        : String((b as Record<string, unknown>)[col.key] ?? "");
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const r = String(av).localeCompare(String(bv), "sv");
      return sortDir === "asc" ? r : -r;
    });
  }, [searched, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const alignClass = (a?: DataTableColumn<T>["align"]) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div className={cn("space-y-3", className)}>
      {(searchable || toolbar) && (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {searchable && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="h-9 pl-10"
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div
        className={cn(
          "surface-card overflow-hidden",
          mobileHorizontalScroll && "overflow-x-auto",
        )}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              {columns.map((col) => {
                const active = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                      alignClass(col.align),
                      col.className,
                      col.hideMobile && !mobileHorizontalScroll && "hidden sm:table-cell",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      {col.header}
                      {active ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border/40 transition-colors last:border-0 hover:bg-muted/40",
                  onRowClick && "cursor-pointer",
                  rowClassName?.(row),
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-foreground",
                      alignClass(col.align),
                      col.className,
                      col.hideMobile && !mobileHorizontalScroll && "hidden sm:table-cell",
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="p-4">
            {emptyState ?? <EmptyState title="Inga resultat" description="Justera sökning eller filter." />}
          </div>
        )}
      </div>

      {sorted.length > 0 && (
        <DataTablePagination
          page={safePage + 1}
          pageSize={pageSize}
          total={sorted.length}
          pageSizeOptions={pageSizes}
          onPageChange={(p) => setPage(p - 1)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPage(0);
          }}
        />
      )}
    </div>
  );
}

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  label?: string;
  className?: string;
}

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  label = "Rader per sida",
  className,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="h-7 w-[72px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span>
          {from}–{to} av {total}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={safePage <= 1}
            onClick={() => onPageChange(1)}
            aria-label="Första sidan"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            aria-label="Föregående sida"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-1">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            aria-label="Nästa sida"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="Sista sidan"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
