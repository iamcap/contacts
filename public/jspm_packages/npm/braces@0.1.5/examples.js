/* */ 
'use strict';
var braces = require('./index');
function expand1(arr) {
  arr = Array.isArray(arr) ? arr : [arr];
  return arr.reduce(function(acc, str) {
    return acc.concat(braces(str));
  }, []);
}
console.log(expand1(['{foo,bar}', '{baz,quux}', '{a,{a-{b,c}}}']));
function expand2(val) {
  val = Array.isArray(val) ? val : [val];
  var len = val.length;
  var arr = [];
  var i = 0;
  while (i < len) {
    arr = arr.concat(braces(val[i++]));
  }
  return arr;
}
console.log(expand2(['{foo,bar}', '{baz,quux}', '{a,{a-{b,c}}}']));
