/* */ 
var assert = require('assert');
var qjob = require('../qjobs');
var maxConcurrency = 5;
var interval = 1000;
var q = new qjob({
  maxConcurrency: maxConcurrency,
  interval: interval
});
var maxJobs = 20;
var testExecutedJobs = 0;
var testNbSleep = 0;
var testMaxNbSleep = 4;
var myjob = function(args, next) {
  setTimeout(function() {
    testExecutedJobs++;
    next();
  }, args[1]);
};
for (var i = 0; i < maxJobs; i++) {
  q.add(myjob, ['test' + i, Math.random() * 1000]);
}
q.on('end', function() {
  assert.equal(testExecutedJobs, maxJobs);
  assert.equal(testNbSleep, testMaxNbSleep);
});
q.on('jobStart', function(args) {});
q.on('sleep', function() {
  testNbSleep++;
});
q.on('continu', function() {});
q.run();
