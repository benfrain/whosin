var gulp = require("gulp");
var ts = require("gulp-typescript");
var postcss = require("gulp-postcss");
var simplevars = require("postcss-simple-vars")();
var autoprefixer = require("autoprefixer");
var browserSync = require("browser-sync");
var postcssimport = require("postcss-import");
var postcssColorFunction = require("postcss-color-function");
var assets = require('postcss-assets');
var nested = require("postcss-nested");
var tsProject = ts.createProject("tsconfig.json");
var del = require("del");
var sourcemaps = require("gulp-sourcemaps");

gulp.task("css", function () {
    var processors = [postcssimport({ glob: true }), simplevars, nested, assets({ relative: true }), postcssColorFunction(), autoprefixer({ browsers: ["iOS >= 8", "android 4"] })];

    // Produce a file list off all needed css files and move them to /build

    gulp.src("./preCSS/styles.css").pipe(gulp.dest("./styles.css"));

    return gulp.src("./preCSS/styles.css").pipe(postcss(processors)).pipe(gulp.dest("./build")).pipe(browserSync.stream());
});

// Static server
gulp.task("browser-sync", function () {
    browserSync({
        open: false,
        server: {
            baseDir: "./build",
        },
    });
});

// Delete
gulp.task("clean", function () {
    return del(["build/**/*"]);
});

gulp.task("default", ["clean:mobile"]);

// HTML
gulp.task("html", function () {
    gulp.src("./libs/**/*").pipe(gulp.dest("./build/libs"));
    return gulp.src("./index.html").pipe(gulp.dest("./build"));
});

// Watch
gulp.task("watch", function () {
    // Watch .scss files
    gulp.watch("preCSS/**/*.css", ["css", browserSync.reload]);

    // Watch .ts files
    gulp.watch(["ts/**/*.ts"], ["ts", browserSync.reload]);

    // Watch any files in root html, reload on change
    gulp.watch("*.html", ["html", browserSync.reload]);
});

gulp.task("ts", function () {
    tsProject.src().pipe(sourcemaps.init()).pipe(ts(tsProject)).js.pipe(sourcemaps.write()).pipe(gulp.dest("./build"));
});

gulp.task("default", ["clean", "html", "css", "browser-sync", "ts", "watch"]);
