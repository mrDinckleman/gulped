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
  multipipe = require('multipipe'),
  progeny = require('gulp-progeny'),
  through2 = require('through2').obj,
  sourceMaps = require('gulp-sourcemaps'),
  imageMin = require('gulp-imagemin'),
  browserSync = require('browser-sync').create(),
  rename = require('gulp-rename'),
  del = require('del'),
  zip = require('gulp-zip'),
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
  },
  fonts: {
    src: 'app/fonts',
    dest: 'public/assets/fonts'
  },
  static: {
    src: 'app/static',
    dest: 'public'
  }
};

var banner = '/*!\n' +
  ' * <%= pkg.name %> v<%= pkg.version %><% if (pkg.homepage) { %> (<%= pkg.homepage %>)<% } %>\n' +
  ' * <%= new Date().getFullYear() %> <%= pkg.author %>\n' +
  ' */\n',
  pkg = require('./package.json');

gulp.task('views', function () {
  var global = getJSON(paths.views.src + '/global.json');

  return gulp.src(paths.views.src + '/**/*.ejs', { since: gulp.lastRun('views') })
    .pipe(progeny({
      regexp: /<%-\s*include\(\s*['"]?([^'"]+)['"]?/,
      extensionsList: ['ejs']
    }))
    .pipe(through2(function(file, ext, cb) {
      if (file.basename.indexOf('_') !== 0) {
        this.push(file);
      }
      cb();
    }))
    .pipe(data(function (file) {
      var data = getJSON(file.path.substr(0, file.path.indexOf(file.extname)) + '.json');
      return Object.assign({}, global, data);
    }))
    .pipe(ejs({ production: !isDevelopment }, {}, { ext: '.html' })).on('error', function(error) {
      // Due to issue https://github.com/rogeriopvl/gulp-ejs/issues/86
      // was added custom error handler
      console.error(error.message);
      this.emit('end');
    })
    .pipe(htmlComb())
    .pipe(gulp.dest(paths.views.dest))
    .pipe(browserSync.stream());
});

gulp.task('data', function() {
  return gulp.src(paths.views.src + '/*.json', { since: gulp.lastRun('views') })
    .pipe(through2(function(file, ext, cb) {
      var path,
          now = new Date();
      if (file.basename === 'global.json') {
        path = file.path.slice(0, -file.basename.length);
        fs.readdir(path, function(err, files) {
          if (err) {
            console.error('readdir:', err.message);
            return;
          }
          files.forEach(function(file) {
            if (file.indexOf('.ejs') === -1) return;
            fs.utimes(path + file, now, now, function(err2) {
              if (err2) {
                console.error('utimes:', err2.message);
              }
            });
          });
        });
      } else {
        path = file.path.slice(0, -file.extname.length) + '.ejs';
        fs.utimes(path, now, now, function(err) {
          if (err) {
            console.error('utimes:', err.message);
          }
        });
      }
      cb();
    }));
});

gulp.task('csscomb', function() {
  return gulp.src(paths.styles.src + '/*.scss')
    .pipe(cssComb())
    .pipe(gulp.dest(paths.styles.src));
});

gulp.task('styles', function () {
  var cssMinify = multipipe(
    postCss([ cssNano() ]),
    rename({ suffix: '.min' }),
    gulp.dest(paths.styles.dest)
  );

  return gulp.src(paths.styles.src + '/*.scss')
    .pipe(gulpIf(isDevelopment, sourceMaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(postCss([ autoPrefixer(), atImport() ]))
    .pipe(gulpIf(isDevelopment, sourceMaps.write('./')))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(gulpIf(!isDevelopment, cssMinify))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function () {
  var jsMinify = multipipe(
    uglify({ output: { comments: /^!/ } }),
    rename({ suffix: '.min' }),
    gulp.dest(paths.scripts.dest)
  );

  var imports = getJSON(paths.scripts.src + '/imports.json').src || [];
  imports.push('app.js');

  return gulp.src(imports, { cwd: paths.scripts.src })
    .pipe(gulpIf(isDevelopment, sourceMaps.init()))
    .pipe(concat('app.js'))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulpIf(isDevelopment, sourceMaps.write('./')))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(gulpIf(!isDevelopment, jsMinify))
    .pipe(browserSync.stream());
});

gulp.task('images', function() {
  return gulp.src(paths.images.src + '/**/*')
    .pipe(gulpIf(!isDevelopment, imageMin()))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
  return gulp.src(paths.fonts.src + '/**/*')
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(browserSync.stream());
});

gulp.task('static', function() {
  return gulp.src(paths.static.src + '/**/*')
    .pipe(gulp.dest(paths.static.dest))
    .pipe(browserSync.stream());
});

gulp.task('watch', function() {
  browserSync.init({
    server: {
      baseDir: './public'
    }
  });

  gulp.watch(paths.views.src + '/**/*.ejs', gulp.series('views'));
  gulp.watch(paths.views.src + '/*.json', gulp.series('data'));
  gulp.watch(paths.styles.src + '/**/*.scss', gulp.series('styles'));
  gulp.watch([paths.scripts.src + '/**/*.js', paths.scripts.src + '/imports.json'], gulp.series('scripts'));
  gulp.watch(paths.images.src + '/**/*', gulp.series('images'));
  gulp.watch(paths.fonts.src + '/**/*', gulp.series('fonts'));
  gulp.watch(paths.static.src + '/**/*', gulp.series('static'));
});

gulp.task('clean', function() {
  return del(['public']);
});

gulp.task('zip', function() {
  return gulp.src('public/**/*')
    .pipe(zip(pkg.name + '-' + pkg.version + '+' + (new Date().toISOString().replace(/[T\-:]|\..+/g, '')) + '.zip'))
    .pipe(gulp.dest('release'));
});

gulp.task('default', gulp.series(gulp.parallel('views', 'styles', 'scripts', 'images', 'fonts', 'static'), 'watch'));

gulp.task('build', gulp.series('clean', 'csscomb', gulp.parallel('views', 'styles', 'scripts', 'images', 'fonts', 'static'), 'zip'));

function getJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (err) {
    console.warn('Invalid JSON in ' + file);
  }
  return {};
}
