import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import postcss from "gulp-postcss";
import cssImport from "postcss-import";
import cssnext from "postcss-cssnext";
import BrowserSync from "browser-sync";
import webpack from "webpack";
import webpackConfig from "./webpack.conf";
import svgstore from "gulp-svgstore";
import svgmin from "gulp-svgmin";
import inject from "gulp-inject";
import replace from "gulp-replace";
import cssnano from "cssnano";
import critical from "critical";
import compress_images from "compress-images";

require('events').EventEmitter.defaultMaxListeners = 0;
const browserSync = BrowserSync.create();
const hugoBin = `./bin/hugo.${process.platform === "win32" ? "exe" : process.platform}`;
const defaultArgs = ["-d", "../dist", "-s", "site"];

//gulp.task("hugo", ["compress_webp"], (cb) => buildSite(cb));
gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));
gulp.task("hugo-verbose", (cb) => buildSite(cb, ["-v"]));
gulp.task("build", ["compress_jpg"]);
gulp.task("build-preview", ["css", "js", "cms-assets", "hugo-preview"]);

gulp.task("css", () => (
  gulp.src("./src/css/*.css")
    .pipe(postcss([
      cssImport({from: "./src/css/main.css"}),
      cssnext(),
      cssnano(),
    ]))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream())
));

gulp.task("cms-assets", () => (
  gulp.src("./node_modules/netlify-cms/dist/*.{woff,eot,woff2,ttf,svg,png}")
    .pipe(gulp.dest("./dist/css"))
))

gulp.task("js", (cb) => {
  const myConfig = Object.assign({}, webpackConfig);

  webpack(myConfig, (err, stats) => {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    browserSync.reload();
    cb();
  });
});

gulp.task("svg", () => {
  const svgs = gulp
    .src("site/static/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({inlineSvg: true}));

  function fileContents(filePath, file) {
    return file.contents.toString();
  }

  return gulp
    .src("site/layouts/partials/svg.html")
    .pipe(inject(svgs, {transform: fileContents}))
    .pipe(gulp.dest("site/layouts/partials/"));
});

gulp.task("critical", ["hugo", "css", "cms-assets", "js", "svg"], () => {
    critical.generate({
      inline: true,
      base: 'dist/',
      src: 'index.html',
      css: ['dist/css/main.css'],
      dimensions: [{
        width: 320,
        height: 480
      },{
        width: 768,
        height: 1024
      },{
        width: 1280,
        height: 960
      }],
      dest: 'index-critical.html',
      minify: true,
      extract: false,
      ignore: ['font-face']
    });
});

gulp.task("server", ["compress_jpg"], () => {

  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });

  gulp.watch("./src/js/**/*.js", ["js"]);
  gulp.watch("./src/css/**/*.css", ["css"]);
  gulp.watch("./site/static/img/icons/*.svg", ["svg"]);
  gulp.watch("./site/**/*", ["hugo"]);
});

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload("notify:false");
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
}

gulp.task('compress_webp', function() {
  //[jpg] ---to---> [webp]
  compress_images("site/static/img/**/*.{jpg,JPG,jpeg,JPEG}", "site/static/img/", {compress_force: false, statistic: true, autoupdate: true}, false,
    {jpg: {engine: "webp", command: false}},
    {png: {engine: false, command: false}},
    {svg: {engine: false, command: false}},
    {gif: {engine: false, command: false}}, function(err) {
  });
});

gulp.task('compress_jpg', ["critical"], function() {
  //[jpg] ---to---> [jpg(jpegtran)] WARNING!!! autoupdate  - recommended turn off, he is not needed here - autoupdate: false
  compress_images("site/static/img/**/*.{jpg,JPG,jpeg,JPEG}", "dist/img/", {compress_force: true, statistic: true, autoupdate: false}, false,
    {jpg: {engine: "jpegRecompress", command: ["-m", "smallfry"]}},
    {png: {engine: false, command: false}},
    {svg: {engine: false, command: false}},
    {gif: {engine: false, command: false}}, function() {
  });
});
