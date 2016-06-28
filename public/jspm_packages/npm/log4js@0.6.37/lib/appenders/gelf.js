/* */ 
(function(Buffer, process) {
  "use strict";
  var zlib = require('zlib');
  var layouts = require('../layouts');
  var levels = require('../levels');
  var dgram = require('dgram');
  var util = require('util');
  var debug = require('../debug')('GELF Appender');
  var LOG_EMERG = 0;
  var LOG_ALERT = 1;
  var LOG_CRIT = 2;
  var LOG_ERR = 3;
  var LOG_ERROR = 3;
  var LOG_WARNING = 4;
  var LOG_NOTICE = 5;
  var LOG_INFO = 6;
  var LOG_DEBUG = 7;
  var levelMapping = {};
  levelMapping[levels.ALL] = LOG_DEBUG;
  levelMapping[levels.TRACE] = LOG_DEBUG;
  levelMapping[levels.DEBUG] = LOG_DEBUG;
  levelMapping[levels.INFO] = LOG_INFO;
  levelMapping[levels.WARN] = LOG_WARNING;
  levelMapping[levels.ERROR] = LOG_ERR;
  levelMapping[levels.FATAL] = LOG_CRIT;
  var client;
  function gelfAppender(layout, host, port, hostname, facility) {
    var config,
        customFields;
    if (typeof(host) === 'object') {
      config = host;
      host = config.host;
      port = config.port;
      hostname = config.hostname;
      facility = config.facility;
      customFields = config.customFields;
    }
    host = host || 'localhost';
    port = port || 12201;
    hostname = hostname || require('@empty').hostname();
    layout = layout || layouts.messagePassThroughLayout;
    var defaultCustomFields = customFields || {};
    if (facility) {
      defaultCustomFields._facility = facility;
    }
    client = dgram.createSocket("udp4");
    process.on('exit', function() {
      if (client)
        client.close();
    });
    function addCustomFields(loggingEvent, msg) {
      Object.keys(defaultCustomFields).forEach(function(key) {
        if (key.match(/^_/) && key !== "_id") {
          msg[key] = defaultCustomFields[key];
        }
      });
      var data = loggingEvent.data;
      if (!Array.isArray(data) || data.length === 0)
        return;
      var firstData = data[0];
      if (!firstData.GELF)
        return;
      delete firstData.GELF;
      Object.keys(firstData).forEach(function(key) {
        if (key.match(/^_/) || key !== "_id") {
          msg[key] = firstData[key];
        }
      });
      loggingEvent.data.shift();
    }
    function preparePacket(loggingEvent) {
      var msg = {};
      addCustomFields(loggingEvent, msg);
      msg.short_message = layout(loggingEvent);
      msg.version = "1.1";
      msg.timestamp = msg.timestamp || new Date().getTime() / 1000;
      msg.host = hostname;
      msg.level = levelMapping[loggingEvent.level || levels.DEBUG];
      return msg;
    }
    function sendPacket(packet) {
      try {
        client.send(packet, 0, packet.length, port, host);
      } catch (e) {}
    }
    return function(loggingEvent) {
      var message = preparePacket(loggingEvent);
      zlib.gzip(new Buffer(JSON.stringify(message)), function(err, packet) {
        if (err) {
          console.error(err.stack);
        } else {
          if (packet.length > 8192) {
            debug("Message packet length (" + packet.length + ") is larger than 8k. Not sending");
          } else {
            sendPacket(packet);
          }
        }
      });
    };
  }
  function configure(config) {
    var layout;
    if (config.layout) {
      layout = layouts.layout(config.layout.type, config.layout);
    }
    return gelfAppender(layout, config);
  }
  function shutdown(cb) {
    if (client) {
      client.close(cb);
      client = null;
    }
  }
  exports.appender = gelfAppender;
  exports.configure = configure;
  exports.shutdown = shutdown;
})(require('buffer').Buffer, require('process'));
