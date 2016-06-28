/* */ 
(function(Buffer, process) {
  "use strict";
  var dgram = require('dgram'),
      layouts = require('../layouts'),
      os = require('@empty'),
      util = require('util');
  try {
    var process = require('process');
  } catch (error) {}
  function logFacesAppender(config, layout) {
    var lfsSock = dgram.createSocket('udp4');
    var localhost = "";
    if (os && os.hostname())
      localhost = os.hostname().toString();
    var pid = "";
    if (process && process.pid)
      pid = process.pid;
    return function log(loggingEvent) {
      var lfsEvent = {
        a: config.application || "",
        h: localhost,
        t: loggingEvent.startTime.getTime(),
        p: loggingEvent.level.levelStr,
        g: loggingEvent.categoryName,
        r: pid,
        m: layout(loggingEvent)
      };
      var buffer = new Buffer(JSON.stringify(lfsEvent));
      var lfsHost = config.remoteHost || "127.0.0.1";
      var lfsPort = config.port || 55201;
      lfsSock.send(buffer, 0, buffer.length, lfsPort, lfsHost, function(err, bytes) {
        if (err) {
          console.error("log4js.logFacesAppender send to %s:%d failed, error: %s", config.host, config.port, util.inspect(err));
        }
      });
    };
  }
  function configure(config) {
    var layout;
    if (config.layout)
      layout = layouts.layout(config.layout.type, config.layout);
    else
      layout = layouts.layout("pattern", {
        "type": "pattern",
        "pattern": "%m"
      });
    return logFacesAppender(config, layout);
  }
  exports.appender = logFacesAppender;
  exports.configure = configure;
})(require('buffer').Buffer, require('process'));
