/* */ 
var assert = require('assert');
var qjob = require('../qjobs');
var maxConcurrency = 2;
var q = new qjob({maxConcurrency: maxConcurrency});
var testExecutedJobs = 0;
var testStartFired = false;
var testEndFired = false;
var testJobsStartFired = 0;
var testJobsEndFired = 0;
var testConcurrency = 0;
var testPause = false;
var testUnpause = false;
var myjob = function(args, next) {
  setTimeout(function() {
    testExecutedJobs++;
    next();
  }, 50);
};
for (var i = 0; i < 10; i++) {
  q.add(myjob, ['test' + i]);
}
q.on('start', function() {
  testStartFired = true;
});
q.on('jobStart', function() {
  var running = q.stats()._jobsRunning;
  if (running > testConcurrency)
    testConcurrency = running;
  testJobsStartFired++;
  if (testJobsStartFired == 5) {
    q.abort();
  }
});
q.on('jobEnd', function() {
  testJobsEndFired++;
});
q.on('end', function() {
  testEndFired = true;
  assert.equal(testExecutedJobs, 5);
  assert.equal(testJobsStartFired, 5);
  assert.equal(testJobsEndFired, 5);
  assert.equal(testConcurrency, maxConcurrency);
  assert.ok(testStartFired);
});
var running = q.stats()._jobsRunning;
assert.equal(testExecutedJobs, 0);
assert.equal(testJobsStartFired, 0);
assert.equal(testJobsEndFired, 0);
assert.equal(running, 0);
assert.ok(!testStartFired);
assert.ok(!testEndFired);
q.run();
