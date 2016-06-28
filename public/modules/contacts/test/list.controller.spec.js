import angular from 'angular';
import 'angular-mocks';

import app from '../../../main';

'use strict';
describe('ListController', function() {
    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('app.contacts'));
    
    let ListController, $controller;
    let intializeController = (contacts) => {
        ListController = $controller('ListController', {
            contacts: contacts
        });         
    }
    
    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    it('Should initialize contacts list', function () {
        let mockContact = [{
            firstName: "Foo",
            lastName: "Boo"
        }];
        intializeController(mockContact);
        expect(ListController.contacts).toBe(mockContact); 
    });
    
});