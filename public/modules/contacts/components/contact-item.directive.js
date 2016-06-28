class contactItemController {
    constructor($state) {
        this.$state = $state;
    }

    getClassName () {
        let className = (this.$state.params.contactId === this.contactId) ? 'active' : '';
        return className;
    }
    
    showDetails() {
        if (this.$state.current.name === 'contacts.edit')
            this.$state.go(this.$state.current.name, {'contactId': this.contactId});
        else
            this.$state.go('contacts.details', {'contactId': this.contactId});
    }
    
    getName() {
        let fullName;
        if (this.profile.firstName || this.profile.lastName){
            fullName = this.profile.firstName ? this.profile.firstName : "";
            fullName += this.profile.lastName ? ' ' + this.profile.lastName : "";            
        } else {
            fullName = "No name";
        }
        return fullName;
    }
}
contactItemController.$inject = ['$state'];

export default function contactItemDirective() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: './modules/contacts/components/contact-item.directive.html',
        scope: {
            profile: '=',
            contactId: '@'
        },
        controller: contactItemController,
        controllerAs: 'vm',
        bindToController: true // because the scope is isolated
    };
}