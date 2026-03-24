import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild: {
    drop: mode === "production" ? (["console", "debugger"] as const) : [],
  },
}));
