var gulp = require('gulp');
var $ = require('gulp-load-plugins')({//初始化各种插件引用
        pattern: ['gulp-*', 'browser-sync'],
        replaceString: /\bgulp[\-.]/,
        lazy: true,
        camelize: true
    });

gulp.task('watch', function() {
    var watcher = gulp.watch('../spider');
    watcher.on('change', function(path) {
      $.browserSync.reload(path);
    });
});
    

gulp.task('server', function () {
    //静态服务器
    $.browserSync({
        server: {
            baseDir: '../spider'
        },
        open: "external",
        logConnections: true,
        directory: true
    });
});

gulp.task('default', ['watch', 'server']);