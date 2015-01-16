var gulp = require('gulp');
var browserify = require('browserify');
var clean = require('gulp-clean');
var es6 = require('gulp-es6-transpiler');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var transform = require('vinyl-transform');
var watch = require('gulp-watch');

var watchOthers = ['node_modules/soundworks/'];

var tasks = ['transpile-app', 'clean'];
if (watchOthers && watchOthers.length) {
  tasks.unshift('transpile-lib');
  console.log(tasks);
}

gulp.task('browserify', tasks, function() {
  return gulp.src(['src/**/index.js', '!src/server/index.js'])
    .pipe(transform(function(filename) {
      return browserify(filename).bundle();
    }))
    .pipe(rename(function(path) {
      path.basename = path.dirname;
      path.dirname = "";
    }))
    .pipe(gulp.dest('public/javascripts'));
});

gulp.task('clean', function() {
  return gulp.src('public/javascripts', { read: false })
    .pipe(clean());
});

gulp.task('transpile-app', function() {
  return gulp.src('src/**/*.es6.js')
    .pipe(es6({
      disallowUnknownReferences: false
    }))
    .pipe(rename(function(path) {
      path.basename = path.basename.replace('.es6', '');
    }))
    .pipe(gulp.dest('src/'));
});

gulp.task('transpile-lib', function() {
  watchOthers.forEach(function(otherPath) {
    gulp.src(otherPath + '*/*.es6.js')
      .pipe(es6({
        disallowUnknownReferences: false
      }))
      .pipe(rename(function(path) {
        path.basename = path.basename.replace('.es6', '');
      }))
      .pipe(gulp.dest(otherPath));
  });
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.es6.js'], ['browserify']);

  if (watchOthers && watchOthers.length) {
    watchOthers.forEach(function(otherPath) {
      gulp.watch(otherPath + '*/*.es6.js', ['browserify']);
    });
  }
});

gulp.task('serve', ['transpile-app', 'transpile-lib'], function() {
  return nodemon({
    script: './src/server/index.js',
    ext: 'js html',
    env: {
      'NODE_ENV': 'development'
    },
    nodeArgs: ['--harmony']
  });
});

gulp.task('default', ['browserify', 'serve', 'watch']);