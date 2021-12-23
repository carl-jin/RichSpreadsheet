/**
 * 打包 plugins
 */
const del = require("delete");
const { src, dest, series, parallel } = require("gulp");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const replace = require("gulp-replace");

console.log("开始打包 plugins ");

const paths = {
  //plugins src
  pluginsCss: ["../src/plugins/css/*.css", "../src/plugins/*.css"],
  pluginsJs: [
    "../node_modules/jquery/dist/jquery.min.js",
    "../node_modules/uuid/dist/umd/uuid.min.js",
    "../src/plugins/js/clipboard.min.js",
    "../src/plugins/js/spectrum.min.js",
    "../src/plugins/js/jquery-ui.min.js",
    "../src/plugins/js/jquery.mousewheel.min.js",
    // 'src/plugins/js/numeral.min.js',
    "../src/plugins/js/html2canvas.min.js",
    "../src/plugins/js/localforage.min.js",
    "../src/plugins/js/lodash.min.js",
    "../src/plugins/js/jstat.min.js",
    "../src/plugins/js/crypto-api.min.js",
    "../src/plugins/js/jquery.sPage.min.js",
  ],

  //plugins concat
  concatPluginsCss: "plugins.css",
  concatPluginsJs: "plugins.js",

  //plugins dest
  destPluginsCss: ["../dist/plugins"],
  destPluginsJs: ["../dist/plugins"],

  // Package directory
  dist: "../dist/plugins",
};

function pluginsCss() {
  return src(paths.pluginsCss)
    .pipe(concat(paths.concatPluginsCss))
    .pipe(cleanCSS())
    .pipe(dest(paths.destPluginsCss));
}

function pluginsJs() {
  return (
    src(paths.pluginsJs)
      .pipe(concat(paths.concatPluginsJs))
      //  这个插件只支持浏览器加载
      .pipe(replace('typeof exports', "false"))
      //  这里部分合并的插件, 还是用的 require(jquery) 这里替换下
      .pipe(replace('require("jquery")', "window.jQuery"))
      // .pipe(uglify())
      .pipe(dest(paths.destPluginsJs))
  );
}

function clean() {
  return del([paths.dist], {
    force: true,
  });
}

exports.buildPlugins = series(clean, parallel(pluginsCss, pluginsJs));
