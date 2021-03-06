/* */ 
"use strict";
var vows = require('vows');
var assert = require('assert');
var toLevel = require('../lib/levels').toLevel;
var showProgress = function() {};
var strLevels = ['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal'];
var configs = {
  'nop': 'nop',
  'is undefined': undefined,
  'is null': null,
  'is empty': {},
  'has no levels': {foo: 'bar'},
  'has null levels': {levels: null},
  'has empty levels': {levels: {}},
  'has random levels': {levels: {foo: 'bar'}},
  'has some valid levels': {levels: {A: 'INFO'}}
};
var batches = [];
function getLoggerName(level) {
  return level + '-logger';
}
function getTopLevelContext(nop, configToTest, name) {
  return {topic: function() {
      var log4js = require('../lib/log4js');
      strLevels.forEach(function(l) {
        log4js.getLogger(getLoggerName(l)).setLevel(l);
      });
      if (!nop) {
        showProgress('** Configuring log4js with', configToTest);
        log4js.configure(configToTest);
      } else {
        showProgress('** Not configuring log4js');
      }
      return log4js;
    }};
}
showProgress('Populating batch object...');
function checkForMismatch(topic) {
  var er = topic.log4js.levels.toLevel(topic.baseLevel).isLessThanOrEqualTo(topic.log4js.levels.toLevel(topic.comparisonLevel));
  assert.equal(er, topic.expectedResult, 'Mismatch: for setLevel(' + topic.baseLevel + ') was expecting a comparison with ' + topic.comparisonLevel + ' to be ' + topic.expectedResult);
}
function checkExpectedResult(topic) {
  var result = topic.log4js.getLogger(getLoggerName(topic.baseLevel)).isLevelEnabled(topic.log4js.levels.toLevel(topic.comparisonLevel));
  assert.equal(result, topic.expectedResult, 'Failed: ' + getLoggerName(topic.baseLevel) + '.isLevelEnabled( ' + topic.comparisonLevel + ' ) returned ' + result);
}
function setupBaseLevelAndCompareToOtherLevels(baseLevel) {
  var baseLevelSubContext = 'and checking the logger whose level was set to ' + baseLevel;
  var subContext = {topic: baseLevel};
  batch[context][baseLevelSubContext] = subContext;
  strLevels.forEach(compareToOtherLevels(subContext));
}
function compareToOtherLevels(subContext) {
  var baseLevel = subContext.topic;
  return function(comparisonLevel) {
    var comparisonLevelSubContext = 'with isLevelEnabled(' + comparisonLevel + ')';
    var expectedResult = strLevels.indexOf(baseLevel) <= strLevels.indexOf(comparisonLevel);
    subContext[comparisonLevelSubContext] = {topic: function(baseLevel, log4js) {
        return {
          comparisonLevel: comparisonLevel,
          baseLevel: baseLevel,
          log4js: log4js,
          expectedResult: expectedResult
        };
      }};
    var vow = 'should return ' + expectedResult;
    subContext[comparisonLevelSubContext][vow] = checkExpectedResult;
    var subSubContext = subContext[comparisonLevelSubContext];
    subSubContext['finally checking for comparison mismatch with log4js'] = checkForMismatch;
  };
}
for (var cfg in configs) {
  var configToTest = configs[cfg];
  var nop = configToTest === 'nop';
  var context;
  if (nop) {
    context = 'Setting up loggers with initial levels, then NOT setting a configuration,';
  } else {
    context = 'Setting up loggers with initial levels, then setting a configuration which ' + cfg + ',';
  }
  showProgress('Setting up the vows batch and context for ' + context);
  var batch = {};
  batch[context] = getTopLevelContext(nop, configToTest, context);
  batches.push(batch);
  strLevels.forEach(setupBaseLevelAndCompareToOtherLevels);
}
showProgress('Running tests');
var v = vows.describe('log4js.configure(), with or without a "levels" property');
batches.forEach(function(batch) {
  v = v.addBatch(batch);
});
v.export(module);
