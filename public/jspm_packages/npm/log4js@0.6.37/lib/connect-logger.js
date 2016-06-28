/* */ 
"use strict";
var levels = require('./levels');
var DEFAULT_FORMAT = ':remote-addr - -' + ' ":method :url HTTP/:http-version"' + ' :status :content-length ":referrer"' + ' ":user-agent"';
function getLogger(logger4js, options) {
  if ('object' == typeof options) {
    options = options || {};
  } else if (options) {
    options = {format: options};
  } else {
    options = {};
  }
  var thislogger = logger4js,
      level = levels.toLevel(options.level, levels.INFO),
      fmt = options.format || DEFAULT_FORMAT,
      nolog = options.nolog ? createNoLogCondition(options.nolog) : null;
  return function(req, res, next) {
    if (req._logging)
      return next();
    if (nolog && nolog.test(req.originalUrl))
      return next();
    if (thislogger.isLevelEnabled(level) || options.level === 'auto') {
      var start = new Date(),
          statusCode,
          writeHead = res.writeHead,
          url = req.originalUrl;
      req._logging = true;
      res.writeHead = function(code, headers) {
        res.writeHead = writeHead;
        res.writeHead(code, headers);
        res.__statusCode = statusCode = code;
        res.__headers = headers || {};
        if (options.level === 'auto') {
          level = levels.INFO;
          if (code >= 300)
            level = levels.WARN;
          if (code >= 400)
            level = levels.ERROR;
        } else {
          level = levels.toLevel(options.level, levels.INFO);
        }
      };
      res.on('finish', function() {
        res.responseTime = new Date() - start;
        if (res.statusCode && options.level === 'auto') {
          level = levels.INFO;
          if (res.statusCode >= 300)
            level = levels.WARN;
          if (res.statusCode >= 400)
            level = levels.ERROR;
        }
        if (thislogger.isLevelEnabled(level)) {
          var combined_tokens = assemble_tokens(req, res, options.tokens || []);
          if (typeof fmt === 'function') {
            var line = fmt(req, res, function(str) {
              return format(str, combined_tokens);
            });
            if (line)
              thislogger.log(level, line);
          } else {
            thislogger.log(level, format(fmt, combined_tokens));
          }
        }
      });
    }
    next();
  };
}
function assemble_tokens(req, res, custom_tokens) {
  var array_unique_tokens = function(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i].token == a[j].token) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
  };
  var default_tokens = [];
  default_tokens.push({
    token: ':url',
    replacement: req.originalUrl
  });
  default_tokens.push({
    token: ':protocol',
    replacement: req.protocol
  });
  default_tokens.push({
    token: ':hostname',
    replacement: req.hostname
  });
  default_tokens.push({
    token: ':method',
    replacement: req.method
  });
  default_tokens.push({
    token: ':status',
    replacement: res.__statusCode || res.statusCode
  });
  default_tokens.push({
    token: ':response-time',
    replacement: res.responseTime
  });
  default_tokens.push({
    token: ':date',
    replacement: new Date().toUTCString()
  });
  default_tokens.push({
    token: ':referrer',
    replacement: req.headers.referer || req.headers.referrer || ''
  });
  default_tokens.push({
    token: ':http-version',
    replacement: req.httpVersionMajor + '.' + req.httpVersionMinor
  });
  default_tokens.push({
    token: ':remote-addr',
    replacement: req.headers['x-forwarded-for'] || req.ip || req._remoteAddress || (req.socket && (req.socket.remoteAddress || (req.socket.socket && req.socket.socket.remoteAddress)))
  });
  default_tokens.push({
    token: ':user-agent',
    replacement: req.headers['user-agent']
  });
  default_tokens.push({
    token: ':content-length',
    replacement: (res._headers && res._headers['content-length']) || (res.__headers && res.__headers['Content-Length']) || '-'
  });
  default_tokens.push({
    token: /:req\[([^\]]+)\]/g,
    replacement: function(_, field) {
      return req.headers[field.toLowerCase()];
    }
  });
  default_tokens.push({
    token: /:res\[([^\]]+)\]/g,
    replacement: function(_, field) {
      return res._headers ? (res._headers[field.toLowerCase()] || res.__headers[field]) : (res.__headers && res.__headers[field]);
    }
  });
  return array_unique_tokens(custom_tokens.concat(default_tokens));
}
function format(str, tokens) {
  for (var i = 0; i < tokens.length; i++) {
    str = str.replace(tokens[i].token, tokens[i].replacement);
  }
  return str;
}
function createNoLogCondition(nolog) {
  var regexp = null;
  if (nolog) {
    if (nolog instanceof RegExp) {
      regexp = nolog;
    }
    if (typeof nolog === 'string') {
      regexp = new RegExp(nolog);
    }
    if (Array.isArray(nolog)) {
      var regexpsAsStrings = nolog.map(function convertToStrings(o) {
        return o.source ? o.source : o;
      });
      regexp = new RegExp(regexpsAsStrings.join('|'));
    }
  }
  return regexp;
}
exports.connectLogger = getLogger;
