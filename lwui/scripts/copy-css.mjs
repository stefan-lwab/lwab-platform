import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(resolve(root, "dist"), { recursive: true });

const tokensCss = readFileSync(resolve(root, "src/styles/tokens.css"), "utf8");
const primitivesCss = readFileSync(resolve(root, "src/styles/primitives.css"), "utf8");

copyFileSync(resolve(root, "src/styles/tokens.css"), resolve(root, "dist/tokens.css"));
copyFileSync(resolve(root, "src/styles/primitives.css"), resolve(root, "dist/primitives.css"));

// styles.css is a flat concatenation so consumers need no import resolution.
const bundled = [
  "/* @lwab/lwui — tokens + primitives. Import once, above @tailwind directives. */",
  tokensCss,
  primitivesCss,
].join("\n\n");

writeFileSync(resolve(root, "dist/styles.css"), bundled);

/* ------------------------------------------------------------------
   Tailwind 4 output (VERGINA).
   Generated from the SAME tokens.css so values can never diverge:
   every `--x: <hsl channels>` in :root becomes `--color-x: hsl(var(--x))`
   inside an `@theme inline` block, next to radius/shadow/motion mappings.
   ------------------------------------------------------------------ */
const rootBlock = tokensCss.slice(
  tokensCss.indexOf(":root {") + ":root {".length,
  tokensCss.indexOf("\n}", tokensCss.indexOf(":root {")),
);

const HSL_TRIPLET = /^-?[\d.]+ [\d.]+% [\d.]+%$/;
const colorVars = [];
for (const line of rootBlock.split("\n")) {
  const m = line.match(/^\s*--([a-z0-9-]+):\s*([^;]+);/i);
  if (!m) continue;
  const [, name, rawValue] = m;
  if (HSL_TRIPLET.test(rawValue.trim())) colorVars.push(name);
}

const themeCss = `/* ============================================================
   @lwab/lwui — Tailwind 4 theme (generated, do not edit)
   Generated from src/styles/tokens.css by scripts/copy-css.mjs.

   Usage (Tailwind 4 app, e.g. VERGINA):
     @import "@lwab/lwui/tokens.css";
     @import "tailwindcss";
     @import "@lwab/lwui/theme.css";
     @import "@lwab/lwui/primitives.css";
   ============================================================ */

@theme inline {
${colorVars.map((n) => `  --color-${n}: hsl(var(--${n}));`).join("\n")}

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  --shadow-card: var(--shadow-card);
  --shadow-card-hover: var(--shadow-card-hover);

  --ease-out-soft: var(--ease-out-soft);
}
`;

writeFileSync(resolve(root, "dist/theme.css"), themeCss);
console.log(`lwui: css emitted to dist/ (theme.css: ${colorVars.length} color tokens)`);
