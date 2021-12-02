const { src, dest, series, parallel } = require("gulp");
const del = require("delete");
const paths = {
  staticImages: ["../src/plugins/images/*.png"],
  dist: ["../dist/fonts", "../dist/assets", "../dist/plugins/images"],

  destStaticImages: ["../dist/plugins/images"],
};

function copyStaticImages() {
  return src(paths.staticImages).pipe(dest(paths.destStaticImages));
}

function clean() {
  return del([...paths.dist], {
    force: true,
  });
}

exports.cpStatic = series(clean, parallel(copyStaticImages));
