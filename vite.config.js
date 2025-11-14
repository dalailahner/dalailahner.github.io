import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "static",
  css: {
    transformer: "lightningcss",
    lightningcss: {
      targets: browserslistToTargets(browserslist("baseline widely available")),
    },
  },
  server: {
    open: true,
    watch: process.env?.WSL_DISTRO_NAME ? { usePolling: true } : undefined,
  },
  build: {
    cssMinify: "lightningcss",
    emptyOutDir: true,
  },
});
