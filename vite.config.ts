import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** GitHub Pages: o site fica em https://user.github.io/NOME_DO_REPO/ — no CI use VITE_BASE_PATH=/NOME_DO_REPO/ */
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  esbuild: {
    drop: mode === "production" ? (["console", "debugger"] as const) : [],
  },
}));
