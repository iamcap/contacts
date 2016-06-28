/* */ 
(function(process) {
  "use strict";
  var layouts = require('../layouts'),
      path = require('path'),
      fs = require('fs'),
      streams = require('../streams/index'),
      os = require('@empty'),
      eol = os.EOL || '\n',
      openFiles = [],
      levels = require('../levels');
  process.on('exit', function() {
    openFiles.forEach(function(file) {
      file.end();
    });
  });
  function fileAppender(file, layout, logSize, numBackups, compress, timezoneOffset) {
    var bytesWritten = 0;
    file = path.normalize(file);
    layout = layout || layouts.basicLayout;
    numBackups = numBackups === undefined ? 5 : numBackups;
    numBackups = numBackups === 0 ? 1 : numBackups;
    function openTheStream(file, fileSize, numFiles) {
      var stream;
      if (fileSize) {
        stream = new streams.RollingFileStream(file, fileSize, numFiles, {"compress": compress});
      } else {
        stream = fs.createWriteStream(file, {
          encoding: "utf8",
          mode: parseInt('0644', 8),
          flags: 'a'
        });
      }
      stream.on("error", function(err) {
        console.error("log4js.fileAppender - Writing to file %s, error happened ", file, err);
      });
      return stream;
    }
    var logFile = openTheStream(file, logSize, numBackups);
    openFiles.push(logFile);
    return function(loggingEvent) {
      logFile.write(layout(loggingEvent, timezoneOffset) + eol, "utf8");
    };
  }
  function configure(config, options) {
    var layout;
    if (config.layout) {
      layout = layouts.layout(config.layout.type, config.layout);
    }
    if (options && options.cwd && !config.absolute) {
      config.filename = path.join(options.cwd, config.filename);
    }
    return fileAppender(config.filename, layout, config.maxLogSize, config.backups, config.compress, config.timezoneOffset);
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
  exports.appender = fileAppender;
  exports.configure = configure;
  exports.shutdown = shutdown;
})(require('process'));
