const constants = require("../constants");

class Queue {
    constructor(documentSnapshot) {
        const data = documentSnapshot.data(); 
        this.id = documentSnapshot.id;
        this[constants.USER_ID] = data[constants.USER_ID]; 
        this[constants.IS_ACTIVE] = data[constants.IS_ACTIVE];
    }
}

exports.Queue = Queue; 