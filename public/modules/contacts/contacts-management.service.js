class ContactsManagementService {

    constructor() {
        this.init();
    }

    init() {
        this.contacts = [{
            firstName: "Ethan",
            lastName: "Kim"
        },{
            firstName: "Tony",
            lastName: "Chu"            
        },{
            firstName: "Katherine",
            lastName: "Magpantay"            
        }];        
    }
    
    getList() {
        return this.contacts;
    }

    hasProfile(contactId) {
        let id = parseInt(contactId);
        if (id === NaN || id < 0 || id >= this.contacts.length)
            return false;
        return true;
    }
    getProfileById(id) {
        return this.contacts[id];
    }

    createContact() {
        let profile = {
            
        };
        this.contacts.push(profile);
        return (this.contacts.length - 1);
    }

}

export default ContactsManagementService;