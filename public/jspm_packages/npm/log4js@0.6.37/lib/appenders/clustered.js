/* */ 
(function(process) {
  "use strict";
  var cluster = require('cluster');
  var log4js = require('../log4js');
  function serializeLoggingEvent(loggingEvent) {
    for (var i = 0; i < loggingEvent.data.length; i++) {
      var item = loggingEvent.data[i];
      if (item && item.stack && JSON.stringify(item) === '{}') {
        loggingEvent.data[i] = {stack: item.stack};
      }
    }
    return JSON.stringify(loggingEvent);
  }
  function deserializeLoggingEvent(loggingEventString) {
    var loggingEvent;
    try {
      loggingEvent = JSON.parse(loggingEventString);
      loggingEvent.startTime = new Date(loggingEvent.startTime);
      loggingEvent.level = log4js.levels.toLevel(loggingEvent.level.levelStr);
      for (var i = 0; i < loggingEvent.data.length; i++) {
        var item = loggingEvent.data[i];
        if (item && item.stack) {
          loggingEvent.data[i] = item.stack;
        }
      }
    } catch (e) {
      loggingEvent = {
        startTime: new Date(),
        categoryName: 'log4js',
        level: log4js.levels.ERROR,
        data: ['Unable to parse log:', loggingEventString]
      };
    }
    return loggingEvent;
  }
  function createAppender(config) {
    if (cluster.isMaster) {
      var masterAppender = function(loggingEvent) {
        if (config.actualAppenders) {
          var size = config.actualAppenders.length;
          for (var i = 0; i < size; i++) {
            if (!config.appenders[i].category || config.appenders[i].category === loggingEvent.categoryName) {
              config.actualAppenders[i](loggingEvent);
            }
          }
        }
      };
      cluster.on('fork', function(worker) {
        worker.on('message', function(message) {
          if (message.type && message.type === '::log-message') {
            var loggingEvent = deserializeLoggingEvent(message.event);
            loggingEvent.pid = worker.process.pid;
            loggingEvent.cluster = {
              master: process.pid,
              worker: worker.process.pid,
              workerId: worker.id
            };
            masterAppender(loggingEvent);
          }
        });
      });
      return masterAppender;
    } else {
      return function(loggingEvent) {
        if (cluster.isWorker) {
          process.send({
            type: '::log-message',
            event: serializeLoggingEvent(loggingEvent)
          });
        }
      };
    }
  }
  function configure(config, options) {
    if (config.appenders && cluster.isMaster) {
      var size = config.appenders.length;
      config.actualAppenders = new Array(size);
      for (var i = 0; i < size; i++) {
        log4js.loadAppender(config.appenders[i].type);
        config.actualAppenders[i] = log4js.appenderMakers[config.appenders[i].type](config.appenders[i], options);
      }
    }
    return createAppender(config);
  }
  exports.appender = createAppender;
  exports.configure = configure;
})(require('process'));
