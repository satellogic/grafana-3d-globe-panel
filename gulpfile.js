const gulp = require('gulp');
const del = require('del');
const babel = require('gulp-babel');
const strip = require('gulp-strip-comments');

gulp.task('build', ['clean'], () => {
  // Babel
  gulp.src('src/module.js')
      .pipe(babel())
      .pipe(strip())
      .pipe(gulp.dest('dist'));
  // Cesium, copy it from the npm install directory
  gulp.src('node_modules/cesium/Build/Cesium/Cesium.js')
      .pipe(gulp.dest('dist/Cesium'));
  gulp.src('node_modules/cesium/Build/Cesium/Workers/**/*')
      .pipe(gulp.dest('dist/Cesium/Workers'));
  gulp.src('node_modules/cesium/Build/Cesium/Widgets/**/*')
      .pipe(gulp.dest('dist/Cesium/Widgets'));
  gulp.src('node_modules/cesium/Build/Cesium/Assets/**/*')
      .pipe(gulp.dest('dist/Cesium/Assets'));
  // plugin.json
  gulp.src('plugin.json')
      .pipe(gulp.dest('dist'));
  // README.md
  gulp.src('src/README.md')
      .pipe(gulp.dest('dist'));
  // HTML
  gulp.src('src/**/*.html')
      .pipe(gulp.dest('dist'));
  // CSS
  gulp.src('src/css/**/*')
      .pipe(gulp.dest('dist/css'));
  // Images
  gulp.src('src/img/**/*')
      .pipe(gulp.dest('dist/img'));
});

// Delete the dist directory
gulp.task('clean', () => (del(['dist'])));

// Rerun the task when a file changes
gulp.task('watch', () => {
  gulp.watch([
    'src/**/*',
  ], ['build']);
});

gulp.task('default', ['watch', 'build']);
