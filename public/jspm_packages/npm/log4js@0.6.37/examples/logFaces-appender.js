/* */ 
var log4js = require('../lib/log4js');
log4js.configure({"appenders": [{
    "type": "logFacesAppender",
    "application": "MY-NODEJS",
    "remoteHost": "localhost",
    "port": 55201,
    "layout": {
      "type": "pattern",
      "pattern": "%m"
    }
  }]});
var logger = log4js.getLogger("myLogger");
logger.info("Testing message %s", "arg1");
