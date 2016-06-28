/* */ 
"use strict";
var levels = require('./levels'),
    util = require('util'),
    events = require('events'),
    DEFAULT_CATEGORY = '[default]';
var logWritesEnabled = true;
function LoggingEvent(categoryName, level, data, logger) {
  this.startTime = new Date();
  this.categoryName = categoryName;
  this.data = data;
  this.level = level;
  this.logger = logger;
}
function Logger(name, level) {
  this.category = name || DEFAULT_CATEGORY;
  if (level) {
    this.setLevel(level);
  }
}
util.inherits(Logger, events.EventEmitter);
Logger.DEFAULT_CATEGORY = DEFAULT_CATEGORY;
Logger.prototype.level = levels.TRACE;
Logger.prototype.setLevel = function(level) {
  this.level = levels.toLevel(level, this.level || levels.TRACE);
};
Logger.prototype.removeLevel = function() {
  delete this.level;
};
Logger.prototype.log = function() {
  var logLevel = levels.toLevel(arguments[0], levels.INFO);
  if (!this.isLevelEnabled(logLevel)) {
    return;
  }
  var numArgs = arguments.length - 1;
  var args = new Array(numArgs);
  for (var i = 0; i < numArgs; i++) {
    args[i] = arguments[i + 1];
  }
  this._log(logLevel, args);
};
Logger.prototype.isLevelEnabled = function(otherLevel) {
  return this.level.isLessThanOrEqualTo(otherLevel);
};
['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal', 'Mark'].forEach(function(levelString) {
  addLevelMethods(levelString);
});
function addLevelMethods(level) {
  level = levels.toLevel(level);
  var levelStrLower = level.toString().toLowerCase();
  var levelMethod = levelStrLower.replace(/_([a-z])/g, function(g) {
    return g[1].toUpperCase();
  });
  var isLevelMethod = levelMethod[0].toUpperCase() + levelMethod.slice(1);
  Logger.prototype['is' + isLevelMethod + 'Enabled'] = function() {
    return this.isLevelEnabled(level.toString());
  };
  Logger.prototype[levelMethod] = function() {
    if (logWritesEnabled && this.isLevelEnabled(level)) {
      var numArgs = arguments.length;
      var args = new Array(numArgs);
      for (var i = 0; i < numArgs; i++) {
        args[i] = arguments[i];
      }
      this._log(level, args);
    }
  };
}
Logger.prototype._log = function(level, data) {
  var loggingEvent = new LoggingEvent(this.category, level, data, this);
  this.emit('log', loggingEvent);
};
function disableAllLogWrites() {
  logWritesEnabled = false;
}
function enableAllLogWrites() {
  logWritesEnabled = true;
}
exports.LoggingEvent = LoggingEvent;
exports.Logger = Logger;
exports.disableAllLogWrites = disableAllLogWrites;
exports.enableAllLogWrites = enableAllLogWrites;
exports.addLevelMethods = addLevelMethods;
