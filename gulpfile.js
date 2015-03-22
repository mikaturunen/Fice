/**
 * Gulp usage file for the whole project.
 * Usage cases: Compiling all the typescript files.
 */

"use strict";

var gulp = require("gulp");
var ts = require("gulp-typescript");
var eventStream = require("event-stream");
var jade = require("gulp-jade");
var path = require("path");
var tslint = require("gulp-tslint");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var sequence = require("run-sequence");
var browserify = require("browserify");
var tsify = require("tsify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var babelify = require("babelify");
var watch = require("gulp-watch");
var plumber = require("gulp-plumber");
var batch = require("gulp-batch");

var typeDefinitions = [];
var projectDefinitions = [ ];

var fromDefinitelyTypedClient = [
    "definitions/**/*.d.ts"
];

var typeDefinitionsClient = fromDefinitelyTypedClient
    .concat(projectDefinitions)
    .concat([ "source/**/*.ts" ]);

// TASK NAMES
var taskTslintClient = "tslint-client";
var taskTsc = "ts";
var taskTscClient = "ts-client";
var taskUglifyJs = "uglify-js";
var taskBrowserifyClient = "browserify";

gulp.task(taskTslintClient, function() {
    console.log("Linting Client side TS: " + JSON.stringify(typeDefinitionsClient, null, 2));
    return gulp.src(typeDefinitionsClient).pipe(tslint()).pipe(tslint.report("verbose"));
})

gulp.task(taskBrowserifyClient, function() {
    var bundler = browserify({
        entries: [
            //path.join(__dirname, "source/definitions/client.d.ts"),
            path.join(__dirname, "source/index.js")
        ],
        debug: false
    });

    var bundle = function() {
        return bundler
            .transform(babelify)
        //    .plugin("tsify", { noImplicitAny: true, removeComments: true, declarationFiles: true })
            .bundle()
            .pipe(source( path.normalize("index.min.js") ))
            .pipe(buffer())
        //    .pipe(uglify())
            .pipe(gulp.dest("source"));
    };

    return bundle();
});

gulp.task("watch", function() {
    watch("**/*.js", function() {
        gulp.start("default");
    });
});

// defining the tasks gulp runs -- in default we do basically all the tasks in one
gulp.task("default", function() {
    sequence(
            [ taskBrowserifyClient ]
        );
});
