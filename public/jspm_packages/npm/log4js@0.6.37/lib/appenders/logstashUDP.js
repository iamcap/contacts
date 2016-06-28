/* */ 
(function(Buffer) {
  "use strict";
  var layouts = require('../layouts'),
      dgram = require('dgram'),
      util = require('util');
  function logstashUDP(config, layout) {
    var udp = dgram.createSocket('udp4');
    var type = config.logType ? config.logType : config.category;
    layout = layout || layouts.dummyLayout;
    if (!config.fields) {
      config.fields = {};
    }
    return function log(loggingEvent) {
      if (loggingEvent.data.length > 1) {
        var secondEvData = loggingEvent.data[1];
        for (var k in secondEvData) {
          config.fields[k] = secondEvData[k];
        }
      }
      config.fields.level = loggingEvent.level.levelStr;
      var logObject = {
        "@version": "1",
        "@timestamp": (new Date(loggingEvent.startTime)).toISOString(),
        "type": config.logType ? config.logType : config.category,
        "message": layout(loggingEvent),
        "fields": config.fields
      };
      sendLog(udp, config.host, config.port, logObject);
    };
  }
  function sendLog(udp, host, port, logObject) {
    var buffer = new Buffer(JSON.stringify(logObject));
    udp.send(buffer, 0, buffer.length, port, host, function(err, bytes) {
      if (err) {
        console.error("log4js.logstashUDP - %s:%p Error: %s", host, port, util.inspect(err));
      }
    });
  }
  function configure(config) {
    var layout;
    if (config.layout) {
      layout = layouts.layout(config.layout.type, config.layout);
    }
    return logstashUDP(config, layout);
  }
  exports.appender = logstashUDP;
  exports.configure = configure;
})(require('buffer').Buffer);
