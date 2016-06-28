import 'angular-animate';
import 'angular-ui-bootstrap';

import ContactsManagementService from './contacts-management.service';

import ContactItemDirective from './components/contact-item.directive';
import EditDropdownDirective from './components/edit-dropdown.directive';

import ListController from './list.controller';
import DetailsController from './details.controller';
import EditController from './edit.controller';
//import CreateController from './create.controller';

let contactsModule = angular.module('app.contacts', [    
    'ngAnimate',
    'ui.bootstrap'
]);

contactsModule.service('ContactsManagementService', ContactsManagementService)
    .directive('contactItem', ContactItemDirective)
    .directive('editDropdown', EditDropdownDirective)
    .controller('ListController', ListController)
    .controller('DetailsController', DetailsController)
    .controller('EditController', EditController);
//    .controller('CreateController', CreateController);

contactsModule.config(['$stateProvider', ($stateProvider) => {
  $stateProvider
        .state('contacts', {
            templateUrl: './modules/contacts/views/list.html',
            controller: 'ListController as list',
            url: '/contacts',
            resolve: {
                contacts: ['ContactsManagementService', (ContactsManagementService) => {
                    return ContactsManagementService.getList();
                }]
            }
        })
        .state('contacts.details', {
            templateUrl: './modules/contacts/views/details.html',
            controller: 'DetailsController as details',
            url: '/details/:contactId'
        })
        .state('contacts.edit', {
            templateUrl: './modules/contacts/views/edit.html',
            controller: 'EditController as edit',
            url: '/edit/:contactId'
        });

}]); // end config block

export default contactsModule;