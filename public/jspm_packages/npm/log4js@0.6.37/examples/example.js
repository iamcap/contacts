/* */ 
var log4js = require('../lib/log4js');
log4js.configure({
  appenders: [{
    type: "file",
    filename: "cheese.log",
    category: ['cheese', 'console']
  }, {type: "console"}],
  replaceConsole: true
});
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('pants.log'), 'pants');
var logger = log4js.getLogger('cheese');
logger.setLevel('ERROR');
console.error("AAArgh! Something went wrong", {
  some: "otherObject",
  useful_for: "debug purposes"
});
console.log("This should appear as info output");
logger.trace('Entering cheese testing');
logger.debug('Got cheese.');
logger.info('Cheese is Gouda.');
logger.log('Something funny about cheese.');
logger.warn('Cheese is quite smelly.');
logger.error('Cheese %s is too ripe!', "gouda");
logger.fatal('Cheese was breeding ground for listeria.');
var anotherLogger = log4js.getLogger('another');
anotherLogger.debug("Just checking");
var pantsLog = log4js.getLogger('pants');
pantsLog.debug("Something for pants");
