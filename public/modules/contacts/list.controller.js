class ListController {
    constructor(contacts) {
        this.contacts = contacts;
    }
}

ListController.$inject = ['contacts'];

export default ListController;