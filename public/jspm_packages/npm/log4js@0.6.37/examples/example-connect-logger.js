/* */ 
var log4js = require('../lib/log4js');
var express = require('express');
var app = express();
log4js.configure({appenders: [{type: 'console'}, {
    type: 'file',
    filename: 'logs/log4jsconnect.log',
    category: 'log4jslog'
  }]});
var logger = log4js.getLogger('log4jslog');
app.configure(function() {
  app.use(express.favicon(''));
  app.use(log4js.connectLogger(logger, {level: 'auto'}));
});
app.get('/', function(req, res) {
  res.send('hello world');
});
app.listen(5000);
console.log('server runing at localhost:5000');
console.log('Simulation of normal response: goto localhost:5000');
console.log('Simulation of error response: goto localhost:5000/xxx');
