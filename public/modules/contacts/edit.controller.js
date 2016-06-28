class EditController {
    constructor($state, ContactsManagementService) {
        this.$state = $state;
        this.ContactsManagementService = ContactsManagementService;
        this.init();
    }

    init(ContactsManagementService) {
        let contactId  = this.$state.params.contactId;
        if (this.ContactsManagementService.hasProfile(contactId))
            this.profile = this.ContactsManagementService.getProfileById(contactId)
        else
            this.$state.go('contacts');
    }
    
    goToDetails() {
        this.$state.go('contacts.details', this.$state.params);
    }
}

EditController.$inject = ['$state', 'ContactsManagementService'];

export default EditController;