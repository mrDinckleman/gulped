var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourceMaps = require('gulp-sourcemaps');

gulp.task('sass', function () {
    return gulp.src('app/styles/*.scss')
        .pipe(sourceMaps.init())
            .pipe(sass().on('error', sass.logError))
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest('public/assets/css'));
});

gulp.task('default', gulp.series('sass'));
