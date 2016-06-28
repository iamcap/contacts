/* */ 
(function(process) {
  "use strict";
  var events = require('events'),
      fs = require('fs'),
      path = require('path'),
      util = require('util'),
      layouts = require('./layouts'),
      levels = require('./levels'),
      loggerModule = require('./logger'),
      LoggingEvent = loggerModule.LoggingEvent,
      Logger = loggerModule.Logger,
      ALL_CATEGORIES = '[all]',
      appenders = {},
      loggers = {},
      appenderMakers = {},
      appenderShutdowns = {},
      defaultConfig = {
        appenders: [{type: "console"}],
        replaceConsole: false
      };
  require('./appenders/console');
  function hasLogger(logger) {
    return loggers.hasOwnProperty(logger);
  }
  levels.forName = function(levelStr, levelVal) {
    var level;
    if (typeof levelStr === "string" && typeof levelVal === "number") {
      var levelUpper = levelStr.toUpperCase();
      level = new levels.Level(levelVal, levelUpper);
      loggerModule.addLevelMethods(level);
    }
    return level;
  };
  levels.getLevel = function(levelStr) {
    var level;
    if (typeof levelStr === "string") {
      var levelUpper = levelStr.toUpperCase();
      level = levels.toLevel(levelStr);
    }
    return level;
  };
  function getBufferedLogger(categoryName) {
    var base_logger = getLogger(categoryName);
    var logger = {};
    logger.temp = [];
    logger.target = base_logger;
    logger.flush = function() {
      for (var i = 0; i < logger.temp.length; i++) {
        var log = logger.temp[i];
        logger.target[log.level](log.message);
        delete logger.temp[i];
      }
    };
    logger.trace = function(message) {
      logger.temp.push({
        level: 'trace',
        message: message
      });
    };
    logger.debug = function(message) {
      logger.temp.push({
        level: 'debug',
        message: message
      });
    };
    logger.info = function(message) {
      logger.temp.push({
        level: 'info',
        message: message
      });
    };
    logger.warn = function(message) {
      logger.temp.push({
        level: 'warn',
        message: message
      });
    };
    logger.error = function(message) {
      logger.temp.push({
        level: 'error',
        message: message
      });
    };
    logger.fatal = function(message) {
      logger.temp.push({
        level: 'fatal',
        message: message
      });
    };
    return logger;
  }
  function normalizeCategory(category) {
    return category + '.';
  }
  function doesLevelEntryContainsLogger(levelCategory, loggerCategory) {
    var normalizedLevelCategory = normalizeCategory(levelCategory);
    var normalizedLoggerCategory = normalizeCategory(loggerCategory);
    return normalizedLoggerCategory.substring(0, normalizedLevelCategory.length) == normalizedLevelCategory;
  }
  function doesAppenderContainsLogger(appenderCategory, loggerCategory) {
    var normalizedAppenderCategory = normalizeCategory(appenderCategory);
    var normalizedLoggerCategory = normalizeCategory(loggerCategory);
    return normalizedLoggerCategory.substring(0, normalizedAppenderCategory.length) == normalizedAppenderCategory;
  }
  function getLogger(loggerCategoryName) {
    if (typeof loggerCategoryName !== "string") {
      loggerCategoryName = Logger.DEFAULT_CATEGORY;
    }
    if (!hasLogger(loggerCategoryName)) {
      var level;
      if (levels.config) {
        var keys = Object.keys(levels.config).sort();
        for (var idx = 0; idx < keys.length; idx++) {
          var levelCategory = keys[idx];
          if (doesLevelEntryContainsLogger(levelCategory, loggerCategoryName)) {
            level = levels.config[levelCategory];
          }
        }
      }
      loggers[loggerCategoryName] = new Logger(loggerCategoryName, level);
      var appenderList;
      for (var appenderCategory in appenders) {
        if (doesAppenderContainsLogger(appenderCategory, loggerCategoryName)) {
          appenderList = appenders[appenderCategory];
          appenderList.forEach(function(appender) {
            loggers[loggerCategoryName].addListener("log", appender);
          });
        }
      }
      if (appenders[ALL_CATEGORIES]) {
        appenderList = appenders[ALL_CATEGORIES];
        appenderList.forEach(function(appender) {
          loggers[loggerCategoryName].addListener("log", appender);
        });
      }
    }
    return loggers[loggerCategoryName];
  }
  function addAppender() {
    var args = Array.prototype.slice.call(arguments);
    var appender = args.shift();
    if (args.length === 0 || args[0] === undefined) {
      args = [ALL_CATEGORIES];
    }
    if (Array.isArray(args[0])) {
      args = args[0];
    }
    args.forEach(function(appenderCategory) {
      addAppenderToCategory(appender, appenderCategory);
      if (appenderCategory === ALL_CATEGORIES) {
        addAppenderToAllLoggers(appender);
      } else {
        for (var loggerCategory in loggers) {
          if (doesAppenderContainsLogger(appenderCategory, loggerCategory)) {
            loggers[loggerCategory].addListener("log", appender);
          }
        }
      }
    });
  }
  function addAppenderToAllLoggers(appender) {
    for (var logger in loggers) {
      if (hasLogger(logger)) {
        loggers[logger].addListener("log", appender);
      }
    }
  }
  function addAppenderToCategory(appender, category) {
    if (!appenders[category]) {
      appenders[category] = [];
    }
    appenders[category].push(appender);
  }
  function clearAppenders() {
    appenders = {};
    for (var logger in loggers) {
      if (hasLogger(logger)) {
        loggers[logger].removeAllListeners("log");
      }
    }
  }
  function configureAppenders(appenderList, options) {
    clearAppenders();
    if (appenderList) {
      appenderList.forEach(function(appenderConfig) {
        loadAppender(appenderConfig.type);
        var appender;
        appenderConfig.makers = appenderMakers;
        try {
          appender = appenderMakers[appenderConfig.type](appenderConfig, options);
          addAppender(appender, appenderConfig.category);
        } catch (e) {
          throw new Error("log4js configuration problem for " + util.inspect(appenderConfig), e);
        }
      });
    }
  }
  function configureLevels(_levels) {
    levels.config = _levels;
    if (_levels) {
      var keys = Object.keys(levels.config).sort();
      for (var idx in keys) {
        var category = keys[idx];
        if (category === ALL_CATEGORIES) {
          setGlobalLogLevel(_levels[category]);
        }
        for (var loggerCategory in loggers) {
          if (doesLevelEntryContainsLogger(category, loggerCategory)) {
            loggers[loggerCategory].setLevel(_levels[category]);
          }
        }
      }
    }
  }
  function setGlobalLogLevel(level) {
    Logger.prototype.level = levels.toLevel(level, levels.TRACE);
  }
  function getDefaultLogger() {
    return getLogger(Logger.DEFAULT_CATEGORY);
  }
  var configState = {};
  function loadConfigurationFile(filename) {
    if (filename) {
      return JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    return undefined;
  }
  function configureOnceOff(config, options) {
    if (config) {
      try {
        configureLevels(config.levels);
        configureAppenders(config.appenders, options);
        if (config.replaceConsole) {
          replaceConsole();
        } else {
          restoreConsole();
        }
      } catch (e) {
        throw new Error("Problem reading log4js config " + util.inspect(config) + ". Error was \"" + e.message + "\" (" + e.stack + ")");
      }
    }
  }
  function reloadConfiguration(options) {
    var mtime = getMTime(configState.filename);
    if (!mtime)
      return;
    if (configState.lastMTime && (mtime.getTime() > configState.lastMTime.getTime())) {
      configureOnceOff(loadConfigurationFile(configState.filename), options);
    }
    configState.lastMTime = mtime;
  }
  function getMTime(filename) {
    var mtime;
    try {
      mtime = fs.statSync(configState.filename).mtime;
    } catch (e) {
      getLogger('log4js').warn('Failed to load configuration file ' + filename);
    }
    return mtime;
  }
  function initReloadConfiguration(filename, options) {
    if (configState.timerId) {
      clearInterval(configState.timerId);
      delete configState.timerId;
    }
    configState.filename = filename;
    configState.lastMTime = getMTime(filename);
    configState.timerId = setInterval(reloadConfiguration, options.reloadSecs * 1000, options);
  }
  function configure(configurationFileOrObject, options) {
    var config = configurationFileOrObject;
    config = config || process.env.LOG4JS_CONFIG;
    options = options || {};
    if (config === undefined || config === null || typeof(config) === 'string') {
      if (options.reloadSecs) {
        initReloadConfiguration(config, options);
      }
      config = loadConfigurationFile(config) || defaultConfig;
    } else {
      if (options.reloadSecs) {
        getLogger('log4js').warn('Ignoring configuration reload parameter for "object" configuration.');
      }
    }
    configureOnceOff(config, options);
  }
  var originalConsoleFunctions = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  function replaceConsole(logger) {
    function replaceWith(fn) {
      return function() {
        fn.apply(logger, arguments);
      };
    }
    logger = logger || getLogger("console");
    ['log', 'debug', 'info', 'warn', 'error'].forEach(function(item) {
      console[item] = replaceWith(item === 'log' ? logger.info : logger[item]);
    });
  }
  function restoreConsole() {
    ['log', 'debug', 'info', 'warn', 'error'].forEach(function(item) {
      console[item] = originalConsoleFunctions[item];
    });
  }
  function requireAppender(appender) {
    var appenderModule;
    try {
      appenderModule = require('./appenders/' + appender);
    } catch (e) {
      appenderModule = require(appender);
    }
    return appenderModule;
  }
  function loadAppender(appender, appenderModule) {
    appenderModule = appenderModule || requireAppender(appender);
    if (!appenderModule) {
      throw new Error("Invalid log4js appender: " + util.inspect(appender));
    }
    module.exports.appenders[appender] = appenderModule.appender.bind(appenderModule);
    if (appenderModule.shutdown) {
      appenderShutdowns[appender] = appenderModule.shutdown.bind(appenderModule);
    }
    appenderMakers[appender] = appenderModule.configure.bind(appenderModule);
  }
  function shutdown(cb) {
    loggerModule.disableAllLogWrites();
    var completed = 0;
    var error;
    var shutdownFcts = [];
    var complete = function(err) {
      error = error || err;
      completed++;
      if (completed >= shutdownFcts.length) {
        cb(error);
      }
    };
    for (var category in appenderShutdowns) {
      if (appenderShutdowns.hasOwnProperty(category)) {
        shutdownFcts.push(appenderShutdowns[category]);
      }
    }
    if (!shutdownFcts.length) {
      return cb();
    }
    shutdownFcts.forEach(function(shutdownFct) {
      shutdownFct(complete);
    });
  }
  module.exports = {
    getBufferedLogger: getBufferedLogger,
    getLogger: getLogger,
    getDefaultLogger: getDefaultLogger,
    hasLogger: hasLogger,
    addAppender: addAppender,
    loadAppender: loadAppender,
    clearAppenders: clearAppenders,
    configure: configure,
    shutdown: shutdown,
    replaceConsole: replaceConsole,
    restoreConsole: restoreConsole,
    levels: levels,
    setGlobalLogLevel: setGlobalLogLevel,
    layouts: layouts,
    appenders: {},
    appenderMakers: appenderMakers,
    connectLogger: require('./connect-logger').connectLogger
  };
  configure();
})(require('process'));
