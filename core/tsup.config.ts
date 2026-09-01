import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "@supabase/supabase-js", "@lwab/lwui", "lucide-react"],
  banner: { js: '"use client";' },
});
