/* */ 
"use strict";
var debug = require('../debug')('fileSync'),
    layouts = require('../layouts'),
    path = require('path'),
    fs = require('fs'),
    streams = require('../streams/index'),
    os = require('@empty'),
    eol = os.EOL || '\n';
;
function RollingFileSync(filename, size, backups, options) {
  debug("In RollingFileStream");
  function throwErrorIfArgumentsAreNotValid() {
    if (!filename || !size || size <= 0) {
      throw new Error("You must specify a filename and file size");
    }
  }
  throwErrorIfArgumentsAreNotValid();
  this.filename = filename;
  this.size = size;
  this.backups = backups || 1;
  this.options = options || {
    encoding: 'utf8',
    mode: parseInt('0644', 8),
    flags: 'a'
  };
  this.currentSize = 0;
  function currentFileSize(file) {
    var fileSize = 0;
    try {
      fileSize = fs.statSync(file).size;
    } catch (e) {
      fs.appendFileSync(filename, '');
    }
    return fileSize;
  }
  this.currentSize = currentFileSize(this.filename);
}
RollingFileSync.prototype.shouldRoll = function() {
  debug("should roll with current size %d, and max size %d", this.currentSize, this.size);
  return this.currentSize >= this.size;
};
RollingFileSync.prototype.roll = function(filename) {
  var that = this,
      nameMatcher = new RegExp('^' + path.basename(filename));
  function justTheseFiles(item) {
    return nameMatcher.test(item);
  }
  function index(filename_) {
    return parseInt(filename_.substring((path.basename(filename) + '.').length), 10) || 0;
  }
  function byIndex(a, b) {
    if (index(a) > index(b)) {
      return 1;
    } else if (index(a) < index(b)) {
      return -1;
    } else {
      return 0;
    }
  }
  function increaseFileIndex(fileToRename) {
    var idx = index(fileToRename);
    debug('Index of ' + fileToRename + ' is ' + idx);
    if (idx < that.backups) {
      try {
        fs.unlinkSync(filename + '.' + (idx + 1));
      } catch (e) {}
      debug('Renaming ' + fileToRename + ' -> ' + filename + '.' + (idx + 1));
      fs.renameSync(path.join(path.dirname(filename), fileToRename), filename + '.' + (idx + 1));
    }
  }
  function renameTheFiles() {
    debug("Renaming the old files");
    var files = fs.readdirSync(path.dirname(filename));
    files.filter(justTheseFiles).sort(byIndex).reverse().forEach(increaseFileIndex);
  }
  debug("Rolling, rolling, rolling");
  renameTheFiles();
};
RollingFileSync.prototype.write = function(chunk, encoding) {
  var that = this;
  function writeTheChunk() {
    debug("writing the chunk to the file");
    that.currentSize += chunk.length;
    fs.appendFileSync(that.filename, chunk);
  }
  debug("in write");
  if (this.shouldRoll()) {
    this.currentSize = 0;
    this.roll(this.filename);
  }
  writeTheChunk();
};
function fileAppender(file, layout, logSize, numBackups, timezoneOffset) {
  debug("fileSync appender created");
  var bytesWritten = 0;
  file = path.normalize(file);
  layout = layout || layouts.basicLayout;
  numBackups = numBackups === undefined ? 5 : numBackups;
  numBackups = numBackups === 0 ? 1 : numBackups;
  function openTheStream(file, fileSize, numFiles) {
    var stream;
    if (fileSize) {
      stream = new RollingFileSync(file, fileSize, numFiles);
    } else {
      stream = (function(f) {
        if (!fs.existsSync(f))
          fs.appendFileSync(f, '');
        return {write: function(data) {
            fs.appendFileSync(f, data);
          }};
      })(file);
    }
    return stream;
  }
  var logFile = openTheStream(file, logSize, numBackups);
  return function(loggingEvent) {
    logFile.write(layout(loggingEvent, timezoneOffset) + eol);
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
  return fileAppender(config.filename, layout, config.maxLogSize, config.backups, config.timezoneOffset);
}
exports.appender = fileAppender;
exports.configure = configure;
