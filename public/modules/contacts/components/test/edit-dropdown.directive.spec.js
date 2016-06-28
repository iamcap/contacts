import angular from 'angular';
import 'angular-mocks';

import app from '../../../../main';

'use strict';
describe('edit-dropdown directive', function() {
    let $compile, $rootScope, element;
    
    beforeEach(angular.mock.module('app'));
    beforeEach(angular.mock.module('app.contacts'));
    beforeEach(angular.mock.module("app.templates")); 
    
    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        element = $compile("<edit-dropdown></edit-dropdown>")($rootScope);
        $rootScope.$digest();
    }));
    
    it('element compiled', function() {
        expect(element.hasClass('btn-group')).toBe(true);
    });
    
});