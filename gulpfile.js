var gulp = require('gulp'),
  ejs = require('gulp-ejs'),
  data = require('gulp-data'),
  htmlComb = require('gulp-htmlcomb'),
  sass = require('gulp-sass'),
  sourceMaps = require('gulp-sourcemaps'),
  path = require('path'),
  fs = require('fs');

gulp.task('ejs', function () {
  return gulp.src('app/views/*.ejs')
    .pipe(data(function (file) {
      return JSON.parse(fs.readFileSync(file.path.substr(0, file.path.indexOf(file.extname)) + '.json'));
    }))
    .pipe(ejs({}, {}, { ext: '.html' }))
    .pipe(htmlComb())
    .pipe(gulp.dest('public'));
});

gulp.task('sass', function () {
  return gulp.src('app/styles/*.scss')
    .pipe(sourceMaps.init())
      .pipe(sass().on('error', sass.logError))
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest('public/assets/css'));
});

gulp.task('watch', function() {
  gulp.watch(['app/views/**/*.ejs', 'app/views/*.json'], gulp.series('ejs'));
  gulp.watch('app/styles/**/*.scss', gulp.series('sass'));
});

gulp.task('default', gulp.series('ejs', 'sass', 'watch'));
