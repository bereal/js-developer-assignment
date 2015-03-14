var gulp = require ('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');

var paths = {
    static: ['./css/*.css', './index.html'],
    js: ['./js/app.js'],
    jsx: ['./js/*.js*']
}

gulp.task('default', ['js', 'static']);

gulp.task('watch')

gulp.task('js', function(){
    var b = browserify();
    b.transform(reactify);
    paths.js.forEach(function(p) {
        b.add(p);
        b.bundle()
            .pipe(source(p))
            .pipe(gulp.dest('./build'));
    });
});

gulp.task('static', function() {
    gulp.src(paths.static, {base: '.'})
        .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
    gulp.watch(paths.static, ['static']);
    gulp.watch(paths.jsx, ['js']);
});
