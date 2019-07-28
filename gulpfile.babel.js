import gulp from 'gulp';
import ejs from 'gulp-ejs';
import data from 'gulp-data';
import htmlComb from 'gulp-htmlcomb';
import sass from 'gulp-sass';
import header from 'gulp-header';
import postCss from 'gulp-postcss';
import autoPrefixer from 'autoprefixer';
import atImport from 'postcss-import';
import cssNano from 'cssnano';
import bro from 'gulp-bro';
import terser from 'gulp-terser';
import gulpIf from 'gulp-if';
import multiPipe from 'multipipe';
import notify from 'gulp-notify';
import progeny from 'gulp-progeny';
import cached from 'gulp-cached';
import through2Module from 'through2';
import sourceMaps from 'gulp-sourcemaps';
import imageMin from 'gulp-imagemin';
import browserSyncModule from 'browser-sync';
import rename from 'gulp-rename';
import del from 'del';
import zip from 'gulp-zip';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';

import pkg from './package';

const through2 = through2Module.obj;
const browserSync = browserSyncModule.create();

const { argv } = yargs;
const isDevelopment = !argv.p;

const paths = {
  views: {
    src: 'app/views',
    dest: 'public',
  },
  styles: {
    src: 'app/scss',
    dest: 'public/assets/css',
  },
  scripts: {
    src: 'app/js',
    dest: 'public/assets/js',
  },
  images: {
    src: 'app/images',
    dest: 'public/assets/images',
  },
  fonts: {
    src: 'app/fonts',
    dest: 'public/assets/fonts',
  },
  statics: {
    src: 'app/static',
    dest: 'public',
  },
};

const banner = `/*!
 * <%= pkg.name %> v<%= pkg.version %><% if (pkg.homepage) { %> (<%= pkg.homepage %>)<% } %>
 * <%= new Date().getFullYear() %> <%= pkg.author %>
 */
`;

/**
 * @param {string} file
 * @returns {Object}
 */
function getJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (err) {
    throw new Error(`${err.message} (${path.relative(__dirname, file)})`);
  }
}

export function views() {
  return gulp.src(`${paths.views.src}/**/*.ejs`, { since: gulp.lastRun(views) })
    // Create dependency tree
    .pipe(progeny({
      regexp: /<%-\s*include\(\s*['"]?([^'"]+)['"]?/,
      extensionsList: ['ejs'],
    }))
    // Do not parse files which names started with underscore
    .pipe(through2(function ignoreUnderscored(file, ext, cb) {
      if (file.basename.indexOf('_') !== 0) {
        this.push(file);
      }

      cb();
    }))
    // Fill templates with data from json-files
    .pipe(data((file) => {
      const global = getJSON(`${paths.views.src}/global.json`);
      const local = getJSON(`${file.path.substr(0, file.path.indexOf(file.extname))}.json`);
      return { ...global, ...local };
    }))
    .on('error', notify.onError(err => ({
      title: 'Data',
      message: err.message,
    })))
    .pipe(ejs({ production: !isDevelopment }))
    .on('error', notify.onError((err) => {
      console.error(err.message);

      return {
        title: 'Views',
        // https://github.com/mikaelbr/gulp-notify/issues/106
        message: 'Something went wrong', // err.message - TODO wait for fixing gulp-notify
      };
    }))
    .pipe(htmlComb())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest(paths.views.dest))
    .pipe(browserSync.stream());
}

function updateUtime() {
  return gulp.src(`${paths.views.src}/*.json`, { since: gulp.lastRun(views) })
    .pipe(through2(function update(file, ext, cb) {
      const now = new Date();

      // Update 'utimes' for all templates in the directory in case of global data changing
      if (file.basename === 'global.json') {
        const dirPath = file.path.slice(0, -file.basename.length);
        fs.readdir(dirPath, (errDir, files) => {
          if (errDir) {
            this.emit('error', errDir);
            return;
          }

          files.forEach((fileInDir) => {
            if (fileInDir.indexOf('.ejs') === -1) {
              return;
            }

            // Update template's modification time
            fs.utimes(dirPath + fileInDir, now, now, (errFile) => {
              if (errFile) {
                this.emit('error', errFile);
              }
            });
          });
        });
      } else {
        // Update modification time for template with the same name as changed json-file
        const filePath = `${file.path.slice(0, -file.extname.length)}.ejs`;
        fs.utimes(filePath, now, now, (errFile) => {
          if (errFile) {
            this.emit('error', errFile);
          }
        });
      }

      cb();
    }))
    .on('error', notify.onError(err => ({
      title: 'Data',
      message: err.message,
    })));
}

export function styles() {
  const minify = multiPipe(
    postCss([cssNano()]),
    rename({ suffix: '.min' }),
    gulp.dest(paths.styles.dest),
  );

  return gulp.src(`${paths.styles.src}/**/*.scss`)
    .pipe(sourceMaps.init())
    .pipe(cached('styles'))
    .pipe(progeny())
    .pipe(sass({ includePaths: [path.join(__dirname, '/node_modules/')] }))
    .on('error', notify.onError(err => ({
      title: 'Styles',
      message: err.message,
    })))
    .pipe(header(banner, { pkg }))
    .pipe(postCss([autoPrefixer(), atImport()]))
    .pipe(sourceMaps.write(isDevelopment ? './' : undefined))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(gulpIf(!isDevelopment, minify))
    .pipe(browserSync.stream());
}

export function scripts() {
  const minify = multiPipe(
    terser({ output: { comments: /^!/ } }),
    rename({ suffix: '.min' }),
    gulp.dest(paths.scripts.dest),
  );

  return gulp.src(`${paths.scripts.src}/app.js`)
    .pipe(bro({
      transform: [
        ['babelify', { presets: ['@babel/preset-env'] }],
      ],
      detectGlobals: false,
      debug: true,
      error: 'emit',
    }))
    .on('error', notify.onError(err => ({
      title: 'Scripts',
      message: err.message,
    })))
    .pipe(sourceMaps.init({ loadMaps: true }))
    .pipe(header(banner, { pkg }))
    .pipe(sourceMaps.write(isDevelopment ? './' : undefined))
    // .pipe(gulpIf(isDevelopment, sourceMaps.write('./'), sourceMaps.write()))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(gulpIf(!isDevelopment, minify))
    .pipe(browserSync.stream());
}

export function images() {
  const minify = multiPipe(
    imageMin(false, { verbose: true }),
    gulp.dest(paths.images.src),
  );

  return gulp.src(`${paths.images.src}/**/*`, { since: gulp.lastRun(images) })
    .pipe(gulpIf(!isDevelopment, minify))
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}

export function fonts() {
  return gulp.src(`${paths.fonts.src}/**/*`, { since: gulp.lastRun(fonts) })
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(browserSync.stream());
}

export function statics() {
  return gulp.src(`${paths.statics.src}/**/*`, { since: gulp.lastRun(statics) })
    .pipe(gulp.dest(paths.statics.dest))
    .pipe(browserSync.stream());
}

export function watch() {
  browserSync.init({
    server: { baseDir: './public' },
    notify: false,
  });

  gulp.watch(`${paths.views.src}/**/*.ejs`, views);
  gulp.watch(`${paths.views.src}/*.json`, updateUtime);
  gulp.watch(`${paths.styles.src}/**/*.scss`, styles);
  gulp.watch(`${paths.scripts.src}/**/*.js`, scripts);
  gulp.watch(`${paths.images.src}/**/*`, images);
  gulp.watch(`${paths.fonts.src}/**/*`, fonts);
  gulp.watch(`${paths.statics.src}/**/*`, statics);
}

export function clean() {
  return del(['public']);
}

function pack() {
  return gulp.src('public/**/*')
    .pipe(zip(`${pkg.name}-${pkg.version}+${new Date().toISOString().replace(/[T\-:]|\..+/g, '')}.zip`))
    .pipe(gulp.dest('release'));
}

const make = gulp.parallel(views, styles, scripts, images, fonts, statics);

export const build = gulp.series(clean, make, pack);

export default gulp.series(make, watch);
