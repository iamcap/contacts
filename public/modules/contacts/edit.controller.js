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

    getInitial() {
        let initial = '';
        if (this.profile.firstName||this.profile.lastName) {
            initial = this.profile.firstName ? this.profile.firstName.substr(0,1) : '';
            initial += this.profile.lastName ? this.profile.lastName.substr(0,1) : '';
        }
        return initial;
    }
    
    goToDetails() {
        this.$state.go('contacts.details', this.$state.params);
    }
}

EditController.$inject = ['$state', 'ContactsManagementService'];

export default EditController;