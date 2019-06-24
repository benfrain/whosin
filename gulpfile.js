var gulp = require("gulp");
var ts = require("gulp-typescript");
var uglify = require("gulp-uglify");
var postcss = require("gulp-postcss");
var cssnano = require("cssnano");
var simplevars = require("postcss-simple-vars")();
var autoprefixer = require("autoprefixer");
var browserSync = require("browser-sync");
var postcssimport = require("postcss-import");
var postcssColorFunction = require("postcss-color-function");
var assets = require("postcss-assets");
var nested = require("postcss-nested");
var tsProject = ts.createProject("tsconfig.json");
var del = require("del");
var sourcemaps = require("gulp-sourcemaps");
var htmlmin = require("gulp-htmlmin");

var compress = true;

gulp.task("css", function() {
    var processors = [
        postcssimport({
            glob: true
        }),
        simplevars,
        nested,
        assets({
            relative: true
        }),
        postcssColorFunction(),
        autoprefixer({ browsers: ["defaults"] }),
        cssnano()
    ];

    // Produce a file list off all needed css files and move them to /build

    // gulp.src("./preCSS/styles.css").pipe(gulp.dest("./styles.css"));

    return gulp
        .src("./preCSS/styles.css")
        .pipe(postcss(processors))
        .pipe(gulp.dest("./build"))
        .pipe(browserSync.stream());
});

// Static server
gulp.task("browser-sync", function() {
    browserSync({
        open: false,
        server: {
            baseDir: "./build"
        }
    });
});

// Delete
var del = require("del");

gulp.task("clean", function() {
    return del(["build/**/*"]);
});

// HTML
gulp.task("html", function() {
    // gulp.src("./libs/**/*").pipe(gulp.dest("./build/libs"));
    // .pipe(htmlmin({collapseWhitespace: true}))
    return gulp
        .src("./index.html")
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("./build"));
});

gulp.task("pwa", function() {
    // gulp.src("./libs/**/*").pipe(gulp.dest("./build/libs"));
    // .pipe(htmlmin({collapseWhitespace: true}))
    return gulp.src("PWA/**/*").pipe(gulp.dest("./build"));
});

gulp.task("cssImg", function() {
    // gulp.src("./libs/**/*").pipe(gulp.dest("./build/libs"));
    // .pipe(htmlmin({collapseWhitespace: true}))
    return gulp.src("preCSS/img/*").pipe(gulp.dest("./build/img"));
});

// Watch
gulp.task("watch", function() {
    // Watch .scss files
    gulp.watch("preCSS/**/*.css", ["css", browserSync.reload]);

    // Watch .ts files
    gulp.watch(["ts/**/*.ts"], ["ts", browserSync.reload]);

    // Watch any files in root html, reload on change
    gulp.watch("*.html", ["html", browserSync.reload]);
});

gulp.task("ts", function() {
    tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js.pipe(sourcemaps.write())
        .pipe(uglify())
        .pipe(gulp.dest("./build"));
});

gulp.task("default", ["clean", "html", "css", "browser-sync", "ts", "pwa", "cssImg", "watch"]);
