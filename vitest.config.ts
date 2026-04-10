/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  plugins: [],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Use React transform via the babel plugin included in @testing-library
    deps: {
      optimizer: {
        web: {
          include: ["@testing-library/react"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // Alias React JSX transform to avoid dual-react issues
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
