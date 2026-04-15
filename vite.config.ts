import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

/** Produção: https://e-transporte.pro — base /. Em CI: VITE_BASE_PATH (ex.: / para domínio na raiz). */
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        funcionalidades: resolve(__dirname, "funcionalidades.html"),
        modulos: resolve(__dirname, "modulos.html"),
        seguranca: resolve(__dirname, "seguranca.html"),
        blog: resolve(__dirname, "blog.html"),
        blogOperacaoTransfer: resolve(__dirname, "blog-operacao-transfer.html"),
        blogNetworkComunidade: resolve(__dirname, "blog-network-comunidade.html"),
        blogAutomacoesWebhooks: resolve(__dirname, "blog-automacoes-webhooks.html"),
        contato: resolve(__dirname, "contato.html"),
        linkBio: resolve(__dirname, "link/index.html"),
        linkBioRedirect: resolve(__dirname, "link.html"),
      },
    },
  },
  esbuild: {
    drop: mode === "production" ? (["console", "debugger"] as const) : [],
  },
}));
