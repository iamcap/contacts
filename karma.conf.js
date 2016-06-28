module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jspm', 'jasmine'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'verbose', 'coverage', 'junit'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // list of files / patterns to load in the browser
    files: [
        'node_modules/karma-babel-preprocessor/node_modules/babel-core/browser-polyfill.js'
    ],

    jspm: {
        config: 'public/config.js',
        paths: {
            'github:*': 'public/jspm_packages/github/*',
            'npm:*': 'public/jspm_packages/npm/*'
        },
      loadFiles: [
        'public/jspm_packages/github/angular/bower-angular@1.5.7/angular.js',
        'public/jspm_packages/github/angular/bower-angular-mocks@1.5.7/angular-mocks.js',
        'public/modules/**/*.html',          
        'public/modules/**/*.spec.js'],
      serveFiles: [
        'public/main.js',
        'public/modules/**/*.js'
      ]
    },

    proxies: {
      '/public/jspm_packages': '/base/jspm_packages'
      //'/jspm.config.js': '/base/jspm.config.js'
    },

    // list of files to exclude
    exclude: [],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    preprocessors: {
        'public/modules/**/!(confirmation_modal).html': ['ng-html2js'],
        'public/modules/**/*.js': ['babel'],
        'public/modules/**/!(*.spec).js': ['coverage']
    },
    
    babelPreprocessor: {
      options: {
        sourceMap: 'inline'
      }
    },

    coverageReporter: {
        instrumenterOptions: {
            istanbul: {noCompact: true}
        },
        type: 'html',
        dir: 'coverage/'
    },

    ngHtml2JsPreprocessor: {
        stripPrefix: 'public/modules/',
        prependPrefix: './modules/',
        moduleName: 'app.templates'
    },

    junitReporter: {
        outputDir: 'junit',
        outputFile: 'test-results.xml'
    }
  });
};