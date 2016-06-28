/* */ 
"use strict";
var hipchat = require('hipchat-notifier');
var layouts = require('../layouts');
exports.name = 'hipchat';
exports.appender = hipchatAppender;
exports.configure = hipchatConfigure;
function hipchatNotifierResponseCallback(err, response, body) {
  if (err) {
    throw err;
  }
}
function hipchatAppender(config) {
  var notifier = hipchat.make(config.hipchat_room, config.hipchat_token);
  return function(loggingEvent) {
    var notifierFn;
    notifier.setRoom(config.hipchat_room);
    notifier.setFrom(config.hipchat_from || '');
    notifier.setNotify(config.hipchat_notify || false);
    if (config.hipchat_host) {
      notifier.setHost(config.hipchat_host);
    }
    switch (loggingEvent.level.toString()) {
      case "TRACE":
      case "DEBUG":
        notifierFn = "info";
        break;
      case "WARN":
        notifierFn = "warning";
        break;
      case "ERROR":
      case "FATAL":
        notifierFn = "failure";
        break;
      default:
        notifierFn = "success";
    }
    var layoutMessage = config.layout(loggingEvent);
    notifier[notifierFn](layoutMessage, config.hipchat_response_callback || hipchatNotifierResponseCallback);
  };
}
function hipchatConfigure(config) {
  var layout;
  if (!config.layout) {
    config.layout = layouts.messagePassThroughLayout;
  }
  return hipchatAppender(config, layout);
}
