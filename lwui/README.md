# @lwab/lwui

**LWUI** — the single UI library for the LWAB ecosystem. One token set, one Tailwind preset,
one component vocabulary, consumed by all 16 apps as a versioned npm package.

Built by harvesting the strongest surfaces already in production:

| Source app | What LWUI took |
| --- | --- |
| MARATHON | KPI tiles, connection indicator, layout shell rhythm, banners |
| NAVI | Kanban board + task cards, calendar/resource grid, list shells, work-pass chips |
| NEBULA | Stats cards, autosave pill, dashboard card sheen |
| FENIX | DataTable (sort + search + pagination), stat card variants |
| ATLANTIS | FilterToolbar, ConfirmDialog, LoadingState, pagination, drop zone |

## Layers

```
@lwab/lwui
├── primitives/   30 themed shadcn/Radix components (Button, Dialog, Select, Table, …)
├── patterns/     PageHeader, SectionHeader, StatCard, StatusBadge, DataTable,
│                 FilterToolbar, ConfirmDialog, EmptyState, LoadingState, ErrorState,
│                 SurfaceCard, AlertCard, PageShell, PageSection, SplitPane,
│                 NavItem, ThemeToggle, SaveStatusPill, ConnectionIndicator,
│                 NewVersion/Offline/InstallApp banners, DragDropFileInput, skeletons
└── domain/       KanbanBoard + KanbanColumn + TaskCard, GanttChart + GanttBar,
                  CalendarGrid, WorkPassChip
```

Styles ship as CSS, not JS: `dist/styles.css` = canonical tokens + primitive classes.

## Install

```bash
bun add @lwab/lwui
```

The package is published to a private registry, so each app needs an `.npmrc`
(see "Consuming apps" below) and the workspace needs the registry token as a
**Build Secret**.

## Wire it up (3 files)

**1 — `src/index.css`**

```css
@import "@lwab/lwui/styles.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

/* app-specific styles below this line only — never design tokens */
```

**2 — `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";
import lwuiPreset from "@lwab/lwui/preset";

export default {
  presets: [lwuiPreset],
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@lwab/lwui/dist/**/*.{js,cjs}", // so LWUI's own classes survive purge
  ],
  prefix: "",
} satisfies Config;
```

**3 — components**

```tsx
import { PageShell, PageHeader, StatCard, DataTable, StatusBadge, statusTone } from "@lwab/lwui";
```

Delete the app's local `src/components/ui/*`, `src/design-system/*` and any
duplicated `:root` / `.dark` token block as you migrate.

## Rules

- Never redefine a design token outside LWUI.
- Never write `text-white`, `bg-black`, `bg-[#…]` in an app component.
- Gold (`accent`) is reserved for primary CTAs and active state.
- App-specific one-offs live in the app's own CSS, never in LWUI.
- Changing a shared component = a PR to LWUI + a version bump, not a local fork.

## Release

```bash
cd packages/lwui
npm version minor        # or patch / major
bun run build
npm publish
```

CI publishes automatically on a `lwui-v*` tag — see
`.github/workflows/publish-lwui.yml`.

## Versioning

- **patch** — visual fix, no API change
- **minor** — new component or new optional prop
- **major** — removed/renamed component or required-prop change

Consumers pin `^1.0.0`, so minors roll out on the next `bun install`.
