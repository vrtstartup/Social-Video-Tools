export class User {

    public data;
    public key; 

    constructor(user:Object) {
        this.key = user['$key'];
        delete user['$key'];
        delete user['$exists'];
        this.data = user;
    }

    countProjects(){ 
      return this.data.hasOwnProperty('projects') ? Object.keys(this.data['projects']).length : 0;
    }
}