/* */ 
var url = require('url'),
    passes = exports;
var redirectRegex = /^30(1|2|7|8)$/;
[function removeChunked(req, res, proxyRes) {
  if (req.httpVersion === '1.0') {
    delete proxyRes.headers['transfer-encoding'];
  }
}, function setConnection(req, res, proxyRes) {
  if (req.httpVersion === '1.0') {
    proxyRes.headers.connection = req.headers.connection || 'close';
  } else if (!proxyRes.headers.connection) {
    proxyRes.headers.connection = req.headers.connection || 'keep-alive';
  }
}, function setRedirectHostRewrite(req, res, proxyRes, options) {
  if ((options.hostRewrite || options.autoRewrite || options.protocolRewrite) && proxyRes.headers['location'] && redirectRegex.test(proxyRes.statusCode)) {
    var target = url.parse(options.target);
    var u = url.parse(proxyRes.headers['location']);
    if (target.host != u.host) {
      return;
    }
    if (options.hostRewrite) {
      u.host = options.hostRewrite;
    } else if (options.autoRewrite) {
      u.host = req.headers['host'];
    }
    if (options.protocolRewrite) {
      u.protocol = options.protocolRewrite;
    }
    proxyRes.headers['location'] = u.format();
  }
}, function writeHeaders(req, res, proxyRes) {
  Object.keys(proxyRes.headers).forEach(function(key) {
    if (proxyRes.headers[key] != undefined) {
      res.setHeader(String(key).trim(), proxyRes.headers[key]);
    }
  });
}, function writeStatusCode(req, res, proxyRes) {
  res.writeHead(proxyRes.statusCode);
}].forEach(function(func) {
  passes[func.name] = func;
});
