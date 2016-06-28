class editDropdownController {
    constructor($state, $window, $timeout, ContactsManagementService) {
        this.$state = $state;
        this.$window = $window;
        this.$timeout = $timeout;
        this.ContactsManagementService = ContactsManagementService;
        this.init();
    }

    init() {
        console.log("edit-dropdown directive controller initialized");
    }
    
    createContact() {
        let newContactId = this.ContactsManagementService.createContact();
        this.$state.go('contacts.edit', {contactId: newContactId});
    }
    editProfile($event) {
        if (this.$state.current.name !== 'contacts.edit')
            this.$state.go('contacts.edit', this.$state.params);
        this.$timeout(() => {
            let element = this.$window.document.getElementById($event.target.dataset.focusId);
            if(element)
                element.focus();
        });
    }

}
editDropdownController.$inject = ['$state','$window','$timeout', 'ContactsManagementService'];

export default function editDropdownDirective() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './modules/contacts/components/edit-dropdown.directive.html',
        controller: editDropdownController,
        controllerAs: 'editDropdown'
    };
}