/* */ 
'use strict';
var deprecate = require('depd')('body-parser');
var parsers = Object.create(null);
exports = module.exports = deprecate.function(bodyParser, 'bodyParser: use individual json/urlencoded middlewares');
Object.defineProperty(exports, 'json', {
  configurable: true,
  enumerable: true,
  get: createParserGetter('json')
});
Object.defineProperty(exports, 'raw', {
  configurable: true,
  enumerable: true,
  get: createParserGetter('raw')
});
Object.defineProperty(exports, 'text', {
  configurable: true,
  enumerable: true,
  get: createParserGetter('text')
});
Object.defineProperty(exports, 'urlencoded', {
  configurable: true,
  enumerable: true,
  get: createParserGetter('urlencoded')
});
function bodyParser(options) {
  var opts = {};
  if (options) {
    for (var prop in options) {
      if (prop !== 'type') {
        opts[prop] = options[prop];
      }
    }
  }
  var _urlencoded = exports.urlencoded(opts);
  var _json = exports.json(opts);
  return function bodyParser(req, res, next) {
    _json(req, res, function(err) {
      if (err)
        return next(err);
      _urlencoded(req, res, next);
    });
  };
}
function createParserGetter(name) {
  return function get() {
    return loadParser(name);
  };
}
function loadParser(parserName) {
  var parser = parsers[parserName];
  if (parser !== undefined) {
    return parser;
  }
  switch (parserName) {
    case 'json':
      parser = require('./lib/types/json');
      break;
    case 'raw':
      parser = require('./lib/types/raw');
      break;
    case 'text':
      parser = require('./lib/types/text');
      break;
    case 'urlencoded':
      parser = require('./lib/types/urlencoded');
      break;
  }
  return (parsers[parserName] = parser);
}
