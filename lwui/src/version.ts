export const LWUI_VERSION = "1.1.0";

export const LWUI_CHANGELOG = [
  {
    version: "1.1.0",
    date: "2026-09-01",
    notes:
      "Brand palette locked. Navy (#0F1729) is now the default theme in :root with gold " +
      "(#F2DE9C) as primary, the #4D4733 gold-tinted hairline as --border and the " +
      "#0E1728 -> #090E1C sidebar gradient; the light theme moves to an optional .light " +
      "class. Adds the --tone-* KPI scale, and StatCard is rebuilt as MARATHON's KpiCard " +
      "(tone wash, orb, hover lift, sparkline, progress, delta pill) with all raw palette " +
      "colours tokenised. Adds the a11y, layout, surface, motion and print utility layers.",
  },
  {
    version: "1.0.0",
    date: "2026-08-24",
    notes:
      "First release. Unifies the best surfaces from MARATHON, NAVI, NEBULA, FENIX and ATLANTIS: " +
      "30 themed primitives, 20 shared patterns (StatCard, DataTable, PageHeader, states, shells, " +
      "filters, indicators) and 4 domain widgets (kanban, gantt, calendar grid, work-pass chip). " +
      "Ships the canonical design tokens (v1.1.0 token set) and Tailwind preset.",
  },
] as const;
