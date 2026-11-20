import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", migrate: "src/migrate.ts" },
  format: ["cjs"],
  outDir: "dist",
  noExternal: [/.*/],
  external: ["pg-native"],
});
