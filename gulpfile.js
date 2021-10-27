const  {src, dest, watch, series} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');

const css = (callback) => {
  const processors = [
    require('autoprefixer'),
  ];

  src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(dest('./css'));

  callback();
};

const watchFiles = (callback) => {
  watch('./src/scss/**/*.scss', css);
  callback();
};

exports.default = series(css, watchFiles);
exports.css = css;