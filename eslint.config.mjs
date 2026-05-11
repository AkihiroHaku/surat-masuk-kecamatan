import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";

const { flatConfig: nextFlatConfig } = nextPlugin;

export default defineConfig(
  nextFlatConfig.coreWebVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
);
