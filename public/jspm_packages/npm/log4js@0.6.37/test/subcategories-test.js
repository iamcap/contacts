/* */ 
"use strict";
var assert = require('assert'),
    vows = require('vows'),
    sandbox = require('sandboxed-module'),
    log4js = require('../lib/log4js'),
    levels = require('../lib/levels');
vows.describe('subcategories').addBatch({
  'loggers created after levels configuration is loaded': {
    topic: function() {
      log4js.configure({"levels": {
          "sub1": "WARN",
          "sub1.sub11": "TRACE",
          "sub1.sub11.sub111": "WARN",
          "sub1.sub12": "INFO"
        }}, {reloadSecs: 30});
      return {
        "sub1": log4js.getLogger('sub1'),
        "sub11": log4js.getLogger('sub1.sub11'),
        "sub111": log4js.getLogger('sub1.sub11.sub111'),
        "sub12": log4js.getLogger('sub1.sub12'),
        "sub13": log4js.getLogger('sub1.sub13'),
        "sub112": log4js.getLogger('sub1.sub11.sub112'),
        "sub121": log4js.getLogger('sub1.sub12.sub121'),
        "sub0": log4js.getLogger('sub0')
      };
    },
    'check logger levels': function(loggers) {
      assert.equal(loggers.sub1.level, levels.WARN);
      assert.equal(loggers.sub11.level, levels.TRACE);
      assert.equal(loggers.sub111.level, levels.WARN);
      assert.equal(loggers.sub12.level, levels.INFO);
      assert.equal(loggers.sub13.level, levels.WARN);
      assert.equal(loggers.sub112.level, levels.TRACE);
      assert.equal(loggers.sub121.level, levels.INFO);
      assert.equal(loggers.sub0.level, levels.TRACE);
    }
  },
  'loggers created before levels configuration is loaded': {
    topic: function() {
      var loggers = {
        "sub1": log4js.getLogger('sub1'),
        "sub11": log4js.getLogger('sub1.sub11'),
        "sub111": log4js.getLogger('sub1.sub11.sub111'),
        "sub12": log4js.getLogger('sub1.sub12'),
        "sub13": log4js.getLogger('sub1.sub13'),
        "sub112": log4js.getLogger('sub1.sub11.sub112'),
        "sub121": log4js.getLogger('sub1.sub12.sub121'),
        "sub0": log4js.getLogger('sub0')
      };
      log4js.configure({"levels": {
          "sub1": "WARN",
          "sub1.sub11": "TRACE",
          "sub1.sub11.sub111": "WARN",
          "sub1.sub12": "INFO"
        }}, {reloadSecs: 30});
      return loggers;
    },
    'check logger levels': function(loggers) {
      assert.equal(loggers.sub1.level, levels.WARN);
      assert.equal(loggers.sub11.level, levels.TRACE);
      assert.equal(loggers.sub111.level, levels.WARN);
      assert.equal(loggers.sub12.level, levels.INFO);
      assert.equal(loggers.sub13.level, levels.WARN);
      assert.equal(loggers.sub112.level, levels.TRACE);
      assert.equal(loggers.sub121.level, levels.INFO);
      assert.equal(loggers.sub0.level, levels.TRACE);
    }
  }
}).exportTo(module);
