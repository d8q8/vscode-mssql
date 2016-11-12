var gulp = require('gulp');
var del = require('del');
var jeditor = require("gulp-json-editor");
var istanbulReport = require('gulp-istanbul-report');
var shell = require('gulp-shell')

gulp.task('cover:clean', function (done) {
    return del('coverage', done);
});

gulp.task('cover:enableconfig',() => {
    return gulp.src("./coverconfig.json")
    .pipe(jeditor(function(json) {
        json.enabled = true;
        return json; // must return JSON object.
    }))
    .pipe(gulp.dest("./out", {'overwrite':true}));
});

gulp.task('cover:enable', gulp.series('cover:clean', 'html:test', 'cover:enableconfig'));

gulp.task('cover:disable', () => {
    return gulp.src("./coverconfig.json")
    .pipe(jeditor(function(json) {
        json.enabled = false;
        return json; // must return JSON object.
    }))
    .pipe(gulp.dest("./out", {'overwrite':true}));
});

gulp.task('cover:combine', () => {
    return gulp.src(['./coverage/coverage-final.json', './coverage/coverage-html.json'])
    .pipe(istanbulReport({
        reporterOpts: {
            dir: './coverage'
        },
        reporters: [
            {'name': 'lcov'}, // -> ./coverage/report.txt
            {'name': 'cobertura'} // -> ./jsonCov/cov.json
        ]
    }));
});

gulp.task('cover:jenkins:ext', shell.task([
        'code --extensionDevelopmentPath="%WORKSPACE%" --extensionTestsPath="%WORKSPACE%/out/test" --verbose',
    ],
    {
        env: {
            JUNIT_REPORT_PATH: "%WORKSPACE%\\xunit.xml"
        }
    }))

// for running on the jenkins build system
gulp.task('cover:jenkins', gulp.series('cover:clean', 'html:test', 'cover:enableconfig', 'cover:jenkins:ext', 'cover:combine'));