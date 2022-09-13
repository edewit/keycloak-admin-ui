import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import path from "node:path";
import dts from "vite-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    mainFields: ["module"],
    dedupe: ["react", "react-dom"],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "KeycloakMasthead",
      formats: ["es", "umd"],
      fileName: (format) => `keycloak-masthead.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      plugins: [
        peerDepsExternal({
          includeDependencies: true,
        }),
      ],
    },
  },
  plugins: [
    react(),
    checker({ typescript: true }),
    dts({
      insertTypesEntry: true,
    }),
  ],
  test: {
    setupFiles: "vitest.setup.ts",
    watch: false,
    deps: {
      // Ensure '.mjs' files are used for '@patternfly/react-styles'.
      inline: [/@patternfly\/react-styles/],
    },
  },
});
