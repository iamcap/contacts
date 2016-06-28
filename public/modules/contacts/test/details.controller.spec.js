
import angular from 'angular';
import 'angular-mocks';

import app from '../../../main';

'use strict';
describe('DetailsController', function() {
    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('app.contacts'));
    
    let DetailsController, $state, ContactsManagementService, $controller;
    let intializeController = (id) => {
        $state.params.contactId = id;
        DetailsController = $controller('DetailsController', {
            $state: $state,
            ContactsManagementService: ContactsManagementService
        });         
    }
    
    beforeEach(inject(function(_$controller_, _$state_ ,_ContactsManagementService_) {
        $controller = _$controller_;
        $state = _$state_;
        ContactsManagementService = _ContactsManagementService_;
    }));

    it('Should get profile from service', function () {
        spyOn(ContactsManagementService, 'getProfileById');
        intializeController(0);
        expect(ContactsManagementService.getProfileById).toHaveBeenCalledWith(0); 
    });

    it('Should have a contact after initiation', function () {
        // get first contact info
        intializeController(0);
        expect(DetailsController.profile).not.toBeNull();
        expect(DetailsController.profile).not.toBeUndefined();
    });

    it('Profile have value for field', function () {
        // get first contact info
        intializeController(0);
        expect(DetailsController.hasField('firstName')).toBe(true);
        expect(DetailsController.hasField('address')).toBe(false);
    });
    
});