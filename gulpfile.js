var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
const {
    series,
    parallel
} = require('gulp');





gulp.task('nodemon', function (cb) {
    var called = false;
    return nodemon({
        script: './src/app.js',
        ext: 'js',
        ignore: [
            'gulpfile.js',
            'node_modules/',
            '.txt'
        ]
    })
        .on('start', function () {
            if (!called) {
                called = true;
                cb();
            }
        })
        .on('restart', function () {
            setTimeout(function () {
                reload({
                    stream: false
                });
            }, 1000);
        })
        .on('crash', function () {
            nodemon.restart
        });
});
gulp.task('default', parallel( 'nodemon'));