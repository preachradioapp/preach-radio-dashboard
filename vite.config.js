import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  // The 100ms SDK expects Node-style globals.
  define: {
    "process.env": "{}",
    global: "globalThis",
  },
  build: {
    sourcemap: false,
    // The lazily-loaded 100ms (Live page) and Jodit (content editor) chunks are large by nature;
    // they're never part of the initial load.
    chunkSizeWarningLimit: 1500,
    // NOTE: no `manualChunks`. Splitting React and antd into separate vendor chunks creates a
    // circular chunk import: antd reads `React.version` during module init before React's chunk has
    // evaluated, which blanks the app at runtime (the build itself still succeeds). Route-level
    // `lazy()` imports already give us the code splitting that matters.
  },
});
