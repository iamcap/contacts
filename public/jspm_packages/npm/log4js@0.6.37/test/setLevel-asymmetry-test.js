/* */ 
"use strict";
var vows = require('vows');
var assert = require('assert');
var log4js = require('../lib/log4js');
var logger = log4js.getLogger('test-setLevel-asymmetry');
var showProgress = function() {};
var strLevels = ['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal'];
var log4jsLevels = [];
strLevels.forEach(function(l) {
  log4jsLevels.push(log4js.levels.toLevel(l));
});
var levelTypes = {
  'string': strLevels,
  'log4js.levels.level': log4jsLevels
};
var batch = {setLevel: {}};
showProgress('Populating batch object...');
for (var type in levelTypes) {
  var context = 'is called with a ' + type;
  var levelsToTest = levelTypes[type];
  showProgress('Setting up the vows context for ' + context);
  batch.setLevel[context] = {};
  levelsToTest.forEach(function(level) {
    var subContext = 'of ' + level;
    var log4jsLevel = log4js.levels.toLevel(level.toString());
    showProgress('Setting up the vows sub-context for ' + subContext);
    batch.setLevel[context][subContext] = {topic: level};
    for (var comparisonType in levelTypes) {
      levelTypes[comparisonType].forEach(function(comparisonLevel) {
        var t = type;
        var ct = comparisonType;
        var expectedResult = log4jsLevel.isLessThanOrEqualTo(comparisonLevel);
        var vow = 'isLevelEnabled(' + comparisonLevel + ') called with a ' + comparisonType + ' should return ' + expectedResult;
        showProgress('Setting up the vows vow for ' + vow);
        batch.setLevel[context][subContext][vow] = function(levelToSet) {
          logger.setLevel(levelToSet);
          showProgress('*** Checking setLevel( ' + level + ' ) of type ' + t + ', and isLevelEnabled( ' + comparisonLevel + ' ) of type ' + ct + '. Expecting: ' + expectedResult);
          assert.equal(logger.isLevelEnabled(comparisonLevel), expectedResult, 'Failed: calling setLevel( ' + level + ' ) with type ' + type + ', isLevelEnabled( ' + comparisonLevel + ' ) of type ' + comparisonType + ' did not return ' + expectedResult);
        };
      });
    }
  });
}
showProgress('Running tests...');
vows.describe('log4js setLevel asymmetry fix').addBatch(batch).export(module);
