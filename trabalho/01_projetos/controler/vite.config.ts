import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// Self-hosted Node.js build. Runs on port 3000.
// Production: `npm run build` then `node .output/server/index.mjs`.
export default defineConfig({
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: true,
    strictPort: true,
  },
  preview: {
    port: Number(process.env.PORT ?? 3000),
    host: true,
    strictPort: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
