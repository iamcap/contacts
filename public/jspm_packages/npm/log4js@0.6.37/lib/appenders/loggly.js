/* */ 
(function(process) {
  'use strict';
  var layouts = require('../layouts'),
      loggly = require('loggly'),
      os = require('@empty'),
      passThrough = layouts.messagePassThroughLayout;
  function isAnyObject(value) {
    return value !== null && (typeof value === 'object' || typeof value === 'function');
  }
  function numKeys(o) {
    var res = 0;
    for (var k in o) {
      if (o.hasOwnProperty(k))
        res++;
    }
    return res;
  }
  function processTags(msgListArgs) {
    var msgList = (msgListArgs.length === 1 ? [msgListArgs[0]] : Array.apply(null, msgListArgs));
    return msgList.reduce(function(accum, element, currentIndex, array) {
      if (isAnyObject(element) && Array.isArray(element.tags) && numKeys(element) == 1) {
        accum.additionalTags = accum.additionalTags.concat(element.tags);
      } else {
        accum.deTaggedData.push(element);
      }
      return accum;
    }, {
      deTaggedData: [],
      additionalTags: []
    });
  }
  function logglyAppender(config, layout) {
    var client = loggly.createClient(config);
    if (!layout)
      layout = passThrough;
    return function(loggingEvent) {
      var result = processTags(loggingEvent.data);
      var deTaggedData = result.deTaggedData;
      var additionalTags = result.additionalTags;
      loggingEvent.data = deTaggedData;
      var msg = layout(loggingEvent);
      client.log({
        msg: msg,
        level: loggingEvent.level.levelStr,
        category: loggingEvent.categoryName,
        hostname: os.hostname().toString()
      }, additionalTags);
    };
  }
  function configure(config) {
    var layout;
    if (config.layout) {
      layout = layouts.layout(config.layout.type, config.layout);
    }
    return logglyAppender(config, layout);
  }
  exports.name = 'loggly';
  exports.appender = logglyAppender;
  exports.configure = configure;
})(require('process'));
