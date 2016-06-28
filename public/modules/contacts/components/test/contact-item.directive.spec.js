import angular from 'angular';
import 'angular-mocks';

import app from '../../../../main';

'use strict';
describe('contact-item directive', function() {
    let $compile, $rootScope, $state, element;
    
    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('app.contacts'));
    beforeEach(angular.mock.module("app.templates")); 
    
    beforeEach(inject(function(_$compile_, _$rootScope_, _$state_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $state = _$state_;
        let mockProfile = {
            firstName: "Foo",
            lastName: "Boo"
        };
        $rootScope.profile = mockProfile;
        element = $compile("<contact-item profile='profile' contact-id='1'></contact-item>")($rootScope);
        $rootScope.$digest();

    }));
    
    it('Element compiled and had appropriate content', function() {
        expect(element.hasClass('contact_item')).toBe(true);
    });

    it('navigates to the contact details when clicked', function () {
        element.triggerHandler('click');
        expect($state.params.contactId).toEqual('1');
    });

    it('shows as selected when clicked', function () {
        element.triggerHandler('click');
        expect(element.hasClass('active')).toBe(true);
    });

});