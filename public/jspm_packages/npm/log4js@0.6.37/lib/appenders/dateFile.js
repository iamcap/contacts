/* */ 
(function(process) {
  "use strict";
  var streams = require('../streams/index'),
      layouts = require('../layouts'),
      path = require('path'),
      os = require('@empty'),
      eol = os.EOL || '\n',
      openFiles = [];
  process.on('exit', function() {
    openFiles.forEach(function(file) {
      file.end();
    });
  });
  function appender(filename, pattern, alwaysIncludePattern, layout, timezoneOffset) {
    layout = layout || layouts.basicLayout;
    var logFile = new streams.DateRollingFileStream(filename, pattern, {alwaysIncludePattern: alwaysIncludePattern});
    openFiles.push(logFile);
    return function(logEvent) {
      logFile.write(layout(logEvent, timezoneOffset) + eol, "utf8");
    };
  }
  function configure(config, options) {
    var layout;
    if (config.layout) {
      layout = layouts.layout(config.layout.type, config.layout);
    }
    if (!config.alwaysIncludePattern) {
      config.alwaysIncludePattern = false;
    }
    if (options && options.cwd && !config.absolute) {
      config.filename = path.join(options.cwd, config.filename);
    }
    return appender(config.filename, config.pattern, config.alwaysIncludePattern, layout, config.timezoneOffset);
  }
  function shutdown(cb) {
    var completed = 0;
    var error;
    var complete = function(err) {
      error = error || err;
      completed++;
      if (completed >= openFiles.length) {
        cb(error);
      }
    };
    if (!openFiles.length) {
      return cb();
    }
    openFiles.forEach(function(file) {
      if (!file.write(eol, "utf-8")) {
        file.once('drain', function() {
          file.end(complete);
        });
      } else {
        file.end(complete);
      }
    });
  }
  exports.appender = appender;
  exports.configure = configure;
  exports.shutdown = shutdown;
})(require('process'));
