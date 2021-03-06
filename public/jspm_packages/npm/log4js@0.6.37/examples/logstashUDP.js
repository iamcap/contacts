/* */ 
var log4js = require('../lib/log4js');
log4js.configure({"appenders": [{
    type: "console",
    category: "myLogger"
  }, {
    "host": "127.0.0.1",
    "port": 10001,
    "type": "logstashUDP",
    "logType": "myAppType",
    "fields": {
      "field1": "value1",
      "field2": "value2"
    },
    "layout": {
      "type": "pattern",
      "pattern": "%m"
    },
    "category": "myLogger"
  }]});
var logger = log4js.getLogger("myLogger");
logger.info("Test log message %s", "arg1", "arg2");
