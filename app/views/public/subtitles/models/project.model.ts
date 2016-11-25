export class Project {

    public data;

    constructor(project:any) {
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