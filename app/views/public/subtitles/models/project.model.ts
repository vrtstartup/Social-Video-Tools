export class Project {

    public data;
    public key; 

    constructor(project:any) {
        this.key = project['$key'];
        delete project['$key'];
        delete project['$exists'];
        this.data = project;
    }

    getAnnotations() {
        return this.data.annotations;
    }
    
    setAnnotations() {
        return this.data.annotations;
    }
    updateAnnotations(){

    }
}