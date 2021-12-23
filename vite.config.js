import { defineConfig } from "vite";
import { injectHtml } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    resolve: {
      alias: {
        "@": "./src",
      },
    },
    output: {
      exports: "named",
    },
    build: {
      emptyOutDir: false,
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "RichSpreadsheet",
        fileName: (format) => `RichSpreadsheet.${format}.js`,
      },
      minify: false,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
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
      visualizer({
        open: false,
      }),
    ],
  };
});
