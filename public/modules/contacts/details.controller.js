class DetailsController {
    constructor($state, ContactsManagementService) {
        this.$state = $state;
        this.ContactsManagementService = ContactsManagementService;
        this.init();
    }

    init(ContactsManagementService) {
        let contactId  = this.$state.params.contactId;
        if (this.ContactsManagementService.hasProfile(contactId))
            this.profile = this.ContactsManagementService.getProfileById(contactId)
        else if (this.ContactsManagementService.hasProfile(0)) {
            this.$state.go('contacts.details', {contactId: 0});
        } else {
            this.$state.go('contacts');
        }

    }
    
    hasField(fieldName) {
        if (this.profile && this.profile[fieldName] && this.profile[fieldName].toString().trim() !== "")
            return true;
        return false;
    }
    
    getInitial() {
        let initial = '';
        if (this.hasField('firstName')||this.hasField('lastName')) {
            initial = this.profile.firstName ? this.profile.firstName.substr(0,1) : '';
            initial += this.profile.lastName ? this.profile.lastName.substr(0,1) : '';
        }
        return initial;
    }
    
    goToEdit() {
        this.$state.go('contacts.edit', this.$state.params);
    }
}

DetailsController.$inject = ['$state', 'ContactsManagementService'];

export default DetailsController;