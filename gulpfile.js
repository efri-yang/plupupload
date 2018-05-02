

const gulp = require("gulp");

const htmls = require('./gulp/htmls');
const styles = require('./gulp/styles');
const scripts = require('./gulp/scripts');
const images = require('./gulp/images');
const others = require('./gulp/others');
const watchs = require('./gulp/watch');
const servers = require('./gulp/server');
const cleans = require('./gulp/clean');





gulp.task('default', gulp.series(cleans, gulp.parallel(htmls.html,scripts.script,styles.style,images.image,others.other,watchs,servers.server)));






