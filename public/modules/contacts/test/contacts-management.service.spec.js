
import angular from 'angular';
import 'angular-mocks';

import app from '../../../main';

'use strict';
describe('ContactsManagementService', function() {
    var service;
    var contactList;

    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('app.contacts'));
    
    beforeEach(inject(function(_ContactsManagementService_) {
        service = _ContactsManagementService_;
    }));

    beforeEach(function() {
        contactList = service.getList();
    });
    
    it('Should have 3 contacts after initiation', function () {
        expect(contactList.length).toEqual(3);
    });

    it('Should create empty contacts ', function () {
        service.createContact();
        expect(contactList.length).toEqual(4);
    });

    it('Should check contact existence', function () {
        expect(service.hasProfile(1)).toBe(true);
        expect(service.hasProfile(4)).toBe(false);
    });
    
    it('Should get profile', function () {
        var profile = service.getProfileById(1);
        expect(profile).toBe(contactList[1]);
    });
    
});