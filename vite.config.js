import { defineConfig } from "vite";
import { injectHtml } from "vite-plugin-html";

console.log(import.meta.env);

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    resolve: {
      alias: {
        "@": "./src",
      },
    },
    build: {
      emptyOutDir: false,
    },
    plugins: [
      injectHtml({
        data: {
          //  注入 script
          injectScript: isProd
            ? ""
            : ["./dist/plugins/plugins.js"]
                .map((src) => {
                  return `<script src="${src}"></script>`;
                })
                .join("\n"),
          injectStylesheet: isProd
            ? ""
            : ["./dist/plugins/plugins.css"]
                .map((href) => {
                  return `<link rel="stylesheet" href="${href}">`;
                })
                .join("\n"),
        },
      }),
      {
        name: "singleHMR",
        handleHotUpdate({ modules, file }) {
          if (file.match(/xml$/)) return [];

          // 清掉所有依赖注入
          modules.map((m) => {
            m.importedModules = new Set();
            m.importers = new Set();
          });

          return modules;
        },
      },
    ],
  };
});
