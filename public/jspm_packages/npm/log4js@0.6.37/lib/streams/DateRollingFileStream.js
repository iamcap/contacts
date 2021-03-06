/* */ 
"use strict";
var BaseRollingFileStream = require('./BaseRollingFileStream'),
    debug = require('../debug')('DateRollingFileStream'),
    format = require('../date_format'),
    fs = require('fs'),
    util = require('util');
module.exports = DateRollingFileStream;
function findTimestampFromFileIfExists(filename, now) {
  return fs.existsSync(filename) ? fs.statSync(filename).mtime : new Date(now());
}
function DateRollingFileStream(filename, pattern, options, now) {
  debug("Now is " + now);
  if (pattern && typeof(pattern) === 'object') {
    now = options;
    options = pattern;
    pattern = null;
  }
  this.pattern = pattern || '.yyyy-MM-dd';
  this.now = now || Date.now;
  this.lastTimeWeWroteSomething = format.asString(this.pattern, findTimestampFromFileIfExists(filename, this.now));
  this.baseFilename = filename;
  this.alwaysIncludePattern = false;
  if (options) {
    if (options.alwaysIncludePattern) {
      this.alwaysIncludePattern = true;
      filename = this.baseFilename + this.lastTimeWeWroteSomething;
    }
    delete options.alwaysIncludePattern;
    if (Object.keys(options).length === 0) {
      options = null;
    }
  }
  debug("this.now is " + this.now + ", now is " + now);
  DateRollingFileStream.super_.call(this, filename, options);
}
util.inherits(DateRollingFileStream, BaseRollingFileStream);
DateRollingFileStream.prototype.shouldRoll = function() {
  var lastTime = this.lastTimeWeWroteSomething,
      thisTime = format.asString(this.pattern, new Date(this.now()));
  debug("DateRollingFileStream.shouldRoll with now = " + this.now() + ", thisTime = " + thisTime + ", lastTime = " + lastTime);
  this.lastTimeWeWroteSomething = thisTime;
  this.previousTime = lastTime;
  return thisTime !== lastTime;
};
DateRollingFileStream.prototype.roll = function(filename, callback) {
  var that = this;
  debug("Starting roll");
  if (this.alwaysIncludePattern) {
    this.filename = this.baseFilename + this.lastTimeWeWroteSomething;
    this.closeTheStream(this.openTheStream.bind(this, callback));
  } else {
    var newFilename = this.baseFilename + this.previousTime;
    this.closeTheStream(deleteAnyExistingFile.bind(null, renameTheCurrentFile.bind(null, this.openTheStream.bind(this, callback))));
  }
  function deleteAnyExistingFile(cb) {
    fs.unlink(newFilename, function(err) {
      cb();
    });
  }
  function renameTheCurrentFile(cb) {
    debug("Renaming the " + filename + " -> " + newFilename);
    fs.rename(filename, newFilename, cb);
  }
};
