var gulp = require('gulp'),
  ejs = require('gulp-ejs'),
  data = require('gulp-data'),
  htmlComb = require('gulp-htmlcomb'),
  cssComb = require('gulp-csscomb'),
  sass = require('gulp-sass'),
  header = require('gulp-header'),
  postCss = require('gulp-postcss'),
  autoPrefixer = require('autoprefixer'),
  atImport = require('postcss-import'),
  cssNano = require('cssnano'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  gulpIf = require('gulp-if'),
  lazyPipe = require('lazypipe'),
  sourceMaps = require('gulp-sourcemaps'),
  imageMin = require('gulp-imagemin'),
  browserSync = require('browser-sync').create(),
  rename = require('gulp-rename'),
  del = require('del'),
  path = require('path'),
  fs = require('fs');

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

var paths = {
  views: {
    src: 'app/views',
    dest: 'public'
  },
  styles: {
    src: 'app/styles',
    dest: 'public/assets/css'
  },
  scripts: {
    src: 'app/scripts',
    dest: 'public/assets/js'
  },
  images: {
    src: 'app/images',
    dest: 'public/assets/images'
  }
};

var banner = '/*!\n' +
  ' * <%= pkg.name %> v<%= pkg.version %><% if (pkg.homepage) { %> (<%= pkg.homepage %>)<% } %>\n' +
  ' * <%= new Date().getFullYear() %> <%= pkg.author %>\n' +
  ' */\n',
  pkg = require('./package.json');

gulp.task('views', function () {
  var global = getJSON(paths.views.src + '/global.json');

  return gulp.src(paths.views.src + '/*.ejs')
    .pipe(data(function (file) {
      var data = getJSON(file.path.substr(0, file.path.indexOf(file.extname)) + '.json');
      return Object.assign({}, global, data);
    }))
    .pipe(ejs({ production: !isDevelopment }, {}, { ext: '.html' })).on('error', function(error) {
      console.error(error.message);
      this.emit('end');
    })
    .pipe(htmlComb())
    .pipe(gulp.dest(paths.views.dest))
    .pipe(browserSync.stream());
});

gulp.task('csscomb', function() {
  return gulp.src(paths.styles.src + '/*.scss')
    .pipe(cssComb())
    .pipe(gulp.dest(paths.styles.src));
});

gulp.task('styles', function () {
  // because of issue https://github.com/OverZealous/lazypipe/issues/14
  // lazypipe will not finish task when placed on the end of pipe queue
  // so gulp.dest was moved to beginning for proper stop
  var cssMinify = lazyPipe()
    .pipe(gulp.dest, paths.styles.dest) // saves non-minified version
    .pipe(postCss, [ cssNano() ])
    .pipe(rename, { suffix: '.min' });

  return gulp.src(paths.styles.src + '/*.scss')
    .pipe(gulpIf(isDevelopment, sourceMaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(postCss([ autoPrefixer(), atImport() ]))
    .pipe(gulpIf(isDevelopment, sourceMaps.write('./')))
    .pipe(gulpIf(!isDevelopment, cssMinify()))
    // saves non-minified files in the case of development
    // and minified files in the case of production
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function () {
  // because of issue https://github.com/OverZealous/lazypipe/issues/14
  // lazypipe will not finish task when placed on the end of pipe queue
  // so gulp.dest was moved to beginning for proper stop
  var jsMinify = lazyPipe()
    .pipe(gulp.dest, paths.scripts.dest) // saves non-minified version
    .pipe(uglify, { output: { comments: /^!/ } })
    .pipe(rename, { suffix: '.min' });

  var imports = getJSON(paths.scripts.src + '/imports.json').src || [];
  imports.push('app.js');

  return gulp.src(imports, { cwd: paths.scripts.src })
    .pipe(gulpIf(isDevelopment, sourceMaps.init()))
    .pipe(concat('app.js'))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulpIf(isDevelopment, sourceMaps.write('./')))
    .pipe(gulpIf(!isDevelopment, jsMinify()))
    // saves non-minified files in the case of development
    // and minified files in the case of production
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
});

gulp.task('images', function() {
  return gulp.src(paths.images.src + '/**/*')
    .pipe(gulpIf(!isDevelopment, imageMin()))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
});

gulp.task('watch', function() {
  browserSync.init({
    server: {
      baseDir: './public'
    }
  });

  gulp.watch([paths.views.src + '/**/*.ejs', paths.views.src + '/*.json'], gulp.series('views'));
  gulp.watch(paths.styles.src + '/**/*.scss', gulp.series('styles'));
  gulp.watch([paths.scripts.src + '/**/*.js', paths.scripts.src + '/imports.json'], gulp.series('scripts'));
  gulp.watch(paths.images.src + '/**/*', gulp.series('images'));
});

gulp.task('clean', function() {
  return del(['public']);
});

gulp.task('default', gulp.series('views', 'styles', 'scripts', 'images', 'watch'));

gulp.task('build', gulp.series('clean', 'views', 'csscomb', 'styles', 'scripts', 'images'));

function getJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (err) {
    console.warn('Invalid JSON in ' + file);
  }
  return {};
}
