/* */ 
var util = require('util');
var events = require('events').EventEmitter;
var qjob = function(options) {
  if (false === (this instanceof qjob)) {
    return new qjob(options);
  }
  this.maxConcurrency = 10;
  this.jobsRunning = 0;
  this.jobsDone = 0;
  this.jobsTotal = 0;
  this.timeStart;
  this.jobId = 0;
  this.jobsList = [];
  this.paused = false;
  this.pausedId = null;
  this.lastPause = 0;
  this.interval = null;
  this.stopAdding = false;
  this.sleeping = false;
  this.aborting = false;
  if (options) {
    this.maxConcurrency = options.maxConcurrency || this.maxConcurrency;
    this.interval = options.interval || this.interval;
  }
  events.call(this);
};
util.inherits(qjob, events);
qjob.prototype.setConcurrency = function(max) {
  this.maxConcurrency = max;
};
qjob.prototype.setInterval = function(delay) {
  this.interval = delay;
};
qjob.prototype.add = function(job, args) {
  var self = this;
  self.jobsList.push([job, args]);
  self.jobsTotal++;
};
qjob.prototype.sleepDueToInterval = function() {
  var self = this;
  if (this.interval === null) {
    return;
  }
  if (this.sleeping) {
    return true;
  }
  if (this.stopAdding) {
    if (this.jobsRunning > 0) {
      return true;
    }
    this.sleeping = true;
    self.emit('sleep');
    setTimeout(function() {
      this.stopAdding = false;
      this.sleeping = false;
      self.emit('continu');
      self.run();
    }.bind(self), this.interval);
    return true;
  }
  if (this.jobsRunning + 1 == this.maxConcurrency) {
    this.stopAdding = true;
    return true;
  }
};
qjob.prototype.run = function() {
  var self = this;
  if (this.jobsDone == 0) {
    self.emit('start');
    this.timeStart = Date.now();
  }
  if (self.sleepDueToInterval())
    return;
  if (self.aborting) {
    this.jobsList = [];
  }
  while (this.jobsList.length && this.jobsRunning < this.maxConcurrency) {
    var job = self.jobsList.shift();
    self.jobsRunning++;
    var args = job[1];
    args._jobId = this.jobId++;
    self.emit('jobStart', args);
    setTimeout(function() {
      this.j(this.args, self.next.bind(self, this.args));
    }.bind({
      j: job[0],
      args: args
    }), 1);
  }
  if (this.jobsList.length == 0 && this.jobsRunning == 0) {
    self.emit('end');
  }
};
qjob.prototype.next = function(args) {
  var self = this;
  this.jobsRunning--;
  this.jobsDone++;
  self.emit('jobEnd', args);
  if (this.paused)
    return;
  self.run();
};
qjob.prototype.pause = function(status) {
  var self = this;
  this.paused = status;
  if (!this.paused && this.pausedId) {
    clearInterval(this.pausedId);
    self.emit('unpause');
    this.run();
  }
  if (this.paused && !this.pausedId) {
    self.lastPause = Date.now();
    this.pausedId = setInterval(function() {
      var since = Date.now() - self.lastPause;
      self.emit('pause', since);
    }, 1000);
    return;
  }
};
qjob.prototype.stats = function() {
  var now = Date.now();
  var o = {};
  o._timeStart = this.timeStart || 'N/A';
  o._timeElapsed = (now - this.timeStart) || 'N/A';
  o._jobsTotal = this.jobsTotal;
  o._jobsRunning = this.jobsRunning;
  o._jobsDone = this.jobsDone;
  o._progress = Math.floor((this.jobsDone / this.jobsTotal) * 100);
  o._concurrency = this.maxConcurrency;
  if (this.paused) {
    o._status = 'Paused';
    return o;
  }
  if (o._timeElapsed == 'N/A') {
    o._status = 'Starting';
    return o;
  }
  if (this.jobsTotal == this.jobsDone) {
    o._status = 'Finished';
    return o;
  }
  o._status = 'Running';
  return o;
};
qjob.prototype.abort = function() {
  this.aborting = true;
};
module.exports = qjob;
