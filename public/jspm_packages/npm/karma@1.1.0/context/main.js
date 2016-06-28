/* */ 
(function(process) {
  var ContextKarma = require('./karma');
  var parentWindow = window.opener || window.parent;
  var callParentKarmaMethod = ContextKarma.getDirectCallParentKarmaMethod(parentWindow);
  var haveParentAccess = false;
  try {
    haveParentAccess = !!parentWindow.window;
  } catch (err) {}
  if (!haveParentAccess) {
    callParentKarmaMethod = ContextKarma.getPostMessageCallParentKarmaMethod(parentWindow);
  }
  window.__karma__ = new ContextKarma(callParentKarmaMethod);
})(require('process'));
