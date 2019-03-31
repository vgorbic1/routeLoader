const gulp         = require('gulp');
const browserSync  = require('browser-sync').create();
const sass         = require('gulp-sass');
const rename       = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const concatCSS      = require('gulp-concat-css');
const cleanCSS       = require('gulp-clean-css');

// Compile Sass and Inject Into Browser
gulp.task('sass', () => {
  return gulp.src(['sass/*.scss'])
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest("css"))
    .pipe(browserSync.stream());
});

// Watch Sass and Serve
gulp.task('serve', ['sass'], () => {
  browserSync.init({
    server: "."  
  });
  gulp.watch(['sass/*.scss', 'sass/**/*.scss'], ['sass']);
  gulp.watch('*.html').on('change', browserSync.reload);
});

// Bundle and minify CSS files 
gulp.task('bundle', () => {
  return gulp.src('css/*.css')
    .pipe(concatCSS("bundle.css"))
    .pipe(cleanCSS({debug: true}, (details) => {
      console.log(`${details.name}: ${details.stats.originalSize}`);
      console.log(`${details.name}: ${details.stats.minifiedSize}`);
    }))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('css'));
});

// Default Task
gulp.task('default', ['serve']);