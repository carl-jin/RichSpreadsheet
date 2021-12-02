import { defineConfig } from "vite";
import { injectHtml } from "vite-plugin-html";

export default defineConfig({
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  plugins: [
    injectHtml({
      data: {
        //  注入 script
        injectScript: ["./dist/plugins/plugins.js"]
          .map((src) => {
            return `<script src="${src}"></script>`;
          })
          .join("\n"),
        injectStylesheet: ["./dist/plugins/plugins.css"]
          .map((href) => {
            return `<link rel="stylesheet" href="${href}">`;
          })
          .join("\n"),
      },
    }),
  ],
});
