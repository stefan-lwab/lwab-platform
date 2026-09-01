/**
 * LWUI — the LWAB Ecosystem UI library.
 *
 * Layer 1 (primitives): themed shadcn/Radix components.
 * Layer 2 (patterns):   the shared LWAB vocabulary (cards, tables, states, shells).
 * Layer 3 (domain):     kanban, gantt, calendar, work-pass widgets.
 *
 * Styles are shipped separately:
 *   import "@lwab/lwui/styles.css";
 *   import lwuiPreset from "@lwab/lwui/preset";
 */

/* ── Layer 1: primitives ─────────────────────────────────── */
export * from "./primitives/accordion";
export * from "./primitives/alert";
export * from "./primitives/alert-dialog";
export * from "./primitives/avatar";
export * from "./primitives/badge";
export * from "./primitives/button";
export * from "./primitives/card";
export * from "./primitives/checkbox";
export * from "./primitives/command";
export * from "./primitives/dialog";
export * from "./primitives/dropdown-menu";
export * from "./primitives/input";
export * from "./primitives/label";
export * from "./primitives/popover";
export * from "./primitives/progress";
export * from "./primitives/radio-group";
export * from "./primitives/scroll-area";
export * from "./primitives/select";
export * from "./primitives/separator";
export * from "./primitives/sheet";
export * from "./primitives/skeleton";
export * from "./primitives/slider";
export { Toaster as SonnerToaster, toast as sonnerToast } from "./primitives/sonner";
export * from "./primitives/switch";
export * from "./primitives/table";
export * from "./primitives/tabs";
export * from "./primitives/textarea";
export * from "./primitives/toast";
export * from "./primitives/toaster";
export * from "./primitives/tooltip";
export * from "./primitives/use-toast";

/* ── Layer 2: patterns ───────────────────────────────────── */
export * from "./patterns/page-header";
export * from "./patterns/stat-card";
export * from "./patterns/status-badge";
export * from "./patterns/states";
export * from "./patterns/shells";
export * from "./patterns/data-table";
export * from "./patterns/filter-toolbar";
export * from "./patterns/confirm-dialog";
export * from "./patterns/navigation";
export * from "./patterns/indicators";
export * from "./patterns/drag-drop-file-input";

/* ── Layer 3: domain widgets ─────────────────────────────── */
export * from "./domain/kanban";
export * from "./domain/gantt";
export * from "./domain/calendar-grid";
export * from "./domain/work-pass-chip";

/* ── Utilities ───────────────────────────────────────────── */
export { cn } from "./lib/utils";
export { LWUI_VERSION } from "./version";
