var gulp = require('gulp'),
  ejs = require('gulp-ejs'),
  data = require('gulp-data'),
  htmlComb = require('gulp-htmlcomb'),
  sass = require('gulp-sass'),
  postCss = require('gulp-postcss'),
  autoPrefixer = require('autoprefixer'),
  atImport = require('postcss-import'),
  cssNano = require('cssnano'),
  gulpIf = require('gulp-if'),
  lazyPipe = require('lazypipe'),
  sourceMaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync').create(),
  rename = require('gulp-rename'),
  del = require('del'),
  path = require('path'),
  fs = require('fs');

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

gulp.task('ejs', function () {
  function getData(file) {
    try {
      return JSON.parse(fs.readFileSync(file));
    } catch (err) {
      console.warn('Invalid JSON in ' + file);
    }
    return {};
  }

  return gulp.src('app/views/*.ejs')
    .pipe(data(function (file) {
      var data = getData(file.path.substr(0, file.path.indexOf(file.extname)) + '.json'),
          global = getData('app/views/global.json');
      return Object.assign({}, global, data);
    }))
    .pipe(ejs({ production: !isDevelopment }, {}, { ext: '.html' }))
    .pipe(htmlComb())
    .pipe(gulp.dest('public'))
    .pipe(browserSync.stream());
});

gulp.task('sass', function () {
  // because of issue https://github.com/OverZealous/lazypipe/issues/14
  // lazypipe will not finish task when placed on the end of pipe queue
  // so gulp.dest was moved to beginning for proper stop
  var cssMinify = lazyPipe()
    .pipe(gulp.dest, 'public/assets/css') // saves non-minified version
    .pipe(postCss, [ cssNano() ])
    .pipe(rename, { suffix: '.min' });

  return gulp.src('app/styles/*.scss')
    .pipe(gulpIf(isDevelopment, sourceMaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(postCss([ autoPrefixer(), atImport() ]))
    .pipe(gulpIf(isDevelopment, sourceMaps.write('./')))
    .pipe(gulpIf(!isDevelopment, cssMinify()))
    // saves non-minified files in the case of development
    // and minified files in the case of production
    .pipe(gulp.dest('public/assets/css'))
    .pipe(browserSync.stream());
});

gulp.task('watch', function() {
  browserSync.init({
    server: {
      baseDir: './public'
    }
  });

  gulp.watch(['app/views/**/*.ejs', 'app/views/*.json'], gulp.series('ejs'));
  gulp.watch('app/styles/**/*.scss', gulp.series('sass'));
});

gulp.task('clean', function() {
  return del(['public']);
});

gulp.task('default', gulp.series('ejs', 'sass', 'watch'));

gulp.task('build', gulp.series('clean', 'ejs', 'sass'));
