/* global document, Messages */

// Framework dependencies
import angular from 'angular';
import 'angular-ui-router';

// Application Modules
import contactsModule from './modules/contacts/module';

/**
 * @ngdoc object
 * @name AppModule
 * @description
 * Create our application, inject dependencies, and configure route behavior
 * NOTE: Injected modules will add their own routes
 */
let AppModule = angular.module('app', [
    'ui.router',
    contactsModule.name
]).controller('AppCtrl', [function() {
    // Nothing to handle in here
    // Submodule will handle 
    console.log('appl initialized');
}])
.config(['$locationProvider', '$httpProvider', '$urlRouterProvider', '$stateProvider',
    function ($locationProvider, $httpProvider, $urlRouterProvider, $stateProvider) {

      // This is default route. 
      $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get('$state');
        $state.go('contacts.details');
      });

    }
  ]);

// Bootstrap 
angular.element(document).ready(function() {
  return angular.bootstrap(document.querySelector('#content'), [AppModule.name], {
    strictDi: true // https://docs.angularjs.org/guide/di
  });
});

export default AppModule;