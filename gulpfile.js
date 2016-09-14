var gulp = require('gulp'),
    gutil = require('gulp-util'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    uncss = require('gulp-uncss'),
    minifyCss = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin');

gulp.task('copy', function() {
    gulp.src(['favicon.ico', 'xo.js', 'package.json', 'README.md'])
        .pipe(gulp.dest('dist'));
});

gulp.task('copy-gif', function() {
    gulp.src('vendor/img/*.gif')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/vendor/img'));
});


gulp.task('html', function () {

    return gulp.src(['index.html'])
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.html', htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist'));
});

gulp.task('css', ['html'], function () {
    return gulp.src('vendor/css/*.css')
        .pipe(concat('styles.css'))
        .pipe(uncss({
            html: ['index.html'],
            ignore: ['.btn-primary']
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 8', 'ie 9']
        }))
        .pipe(minifyCss())
        .pipe(gulp.dest('dist/vendor/css'));
});

gulp.task('default', ['css', 'copy', 'copy-gif']);
