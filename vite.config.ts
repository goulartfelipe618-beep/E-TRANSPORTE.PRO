import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Produção: https://e-transporte.pro — base /. Em CI: VITE_BASE_PATH (ex.: / para domínio na raiz). */
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  esbuild: {
    drop: mode === "production" ? (["console", "debugger"] as const) : [],
  },
}));
