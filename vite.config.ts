import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readdirSync } from "node:fs";

const rootHtml = readdirSync(__dirname).filter(
  (f) => f.endsWith(".html") && f !== "link.html"
);

const input: Record<string, string> = {
  linkBio: resolve(__dirname, "link/index.html"),
  linkBioRedirect: resolve(__dirname, "link.html"),
};

for (const file of rootHtml) {
  const key = file.replace(".html", "").replace(/-/g, "_");
  input[key] = resolve(__dirname, file);
}

/** Produção: https://e-transporte.pro — base /. Em CI: VITE_BASE_PATH (ex.: / para domínio na raiz). */
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [],
  build: {
    cssMinify: true,
    minify: "esbuild",
    rollupOptions: { input },
  },
  esbuild: {
    drop: mode === "production" ? (["console", "debugger"] as const) : [],
  },
}));
