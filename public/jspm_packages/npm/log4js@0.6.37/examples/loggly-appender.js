/* */ 
var log4js = require('../lib/log4js');
log4js.configure({"appenders": [{
    type: "console",
    category: "test"
  }, {
    "type": "loggly",
    "token": "12345678901234567890",
    "subdomain": "your-subdomain",
    "tags": ["test"],
    "category": "loggly"
  }]});
var logger = log4js.getLogger("loggly");
logger.info("Test log message");
