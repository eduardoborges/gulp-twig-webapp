'use-strict';

var gulp        = require('gulp');
var concat      = require('gulp-concat');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var twig        = require('gulp-twig');
var uglify      = require('gulp-uglify');
const del       = require('del');
var wiredep     = require('gulp-wiredep')
var gulpif      = require('gulp-inject');
var useref      = require('gulp-useref');
var gulpif      = require('gulp-if');

var APP_DIR = './app';
var TMP_DIR = './.tmp';
var DIST_DIR = './dist';

gulp.task('sass', function() {
    return gulp.src(APP_DIR + '/css/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest(TMP_DIR + "/css"));
});

gulp.task('twig', function() {
    return gulp.src(APP_DIR + "/*.twig")
        .pipe(twig())
        .pipe(gulp.dest(TMP_DIR))
})

gulp.task('images', function() {
    gulp.src(APP_DIR + '/img/**/**')
      .pipe(gulp.dest(TMP_DIR + '/img'))
});

gulp.task('bower-deps', function() {
    return gulp.src(APP_DIR + '/index.twig')
        .pipe(wiredep())
        .pipe(gulp.dest(APP_DIR))
});

gulp.task('bower_components', function() {
    gulp.src('bower_components/**/**')
      .pipe(gulp.dest(TMP_DIR + '/bower_components'))
});

gulp.task('serve',['sass','twig','bower-deps','images','bower_components'], function() {
   browserSync.init({
        server: TMP_DIR
    });

    gulp.watch('./bower_components/', ['bower-deps']).on('change', browserSync.reload);
    gulp.watch(APP_DIR + "/css/*.scss", ['sass']).on('change', browserSync.reload);
    gulp.watch(APP_DIR + "/*.twig",  ['twig']).on('change', browserSync.reload);
    gulp.watch(APP_DIR + "/img/**/**",  ['images']).on('change', browserSync.reload);
});


gulp.task('dist',['sass','twig','bower-deps'], function() {
    gulp.src(APP_DIR + "*.twig", ['twig']).pipe(gulp.dest(DIST_DIR));
});


////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
///   DISTRIBUITION TASKS //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

gulp.task('twig:dist',['bower-deps'], function() {
    return gulp.src(APP_DIR + "/*.twig")
        .pipe(twig())
        .pipe(gulp.dest(DIST_DIR))
})

gulp.task('images:dist', function() {
    gulp.src(APP_DIR + '/img/**/**')
      .pipe(gulp.dest(DIST_DIR + '/img'))
});


gulp.task('vendor-assets:dist', ['twig:dist'], function(){
  return gulp.src(DIST_DIR + "/*.html")
    .pipe(useref())
    .pipe(sourcemaps.init())
    .pipe(gulpif('*.js', uglify() ))
    //.pipe(sourcemaps.write())
    .pipe(gulpif('*.css', sass({outputStyle: 'compressed'}).on('error', sass.logError) ))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_DIR))
});

gulp.task('sass:dist', function() {
    return gulp.src(APP_DIR + '/css/*.scss')
        .pipe(sass({ outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest(DIST_DIR + "/css"));
});

gulp.task('dist',['twig:dist','images:dist','sass:dist','vendor-assets:dist']);

gulp.task('clean', function() {
  return del.sync(TMP_DIR);
})

