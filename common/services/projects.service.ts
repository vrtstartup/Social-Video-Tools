import { Project } from '../../common/classes/project';

export class Projects {
  private fireBase;
  private logger;

  constructor(fireBase:any, logger?: any) { 
    this.fireBase = fireBase;
    this.logger = logger ? logger : null;
  }

  getProjectByJob(job:any) {
    const refProject = this.fireBase.database.ref(`projects/${job.id}`);

    // return the project.  
    // #todo return value, wth?
    return refProject.once('value')
      .then( snapshot => {
        // for conveniece sake, append the project ID to the return object
        const projectData = snapshot.val();
        projectData.id=snapshot.key;
        return new Project(projectData, this.logger);
      }, err => this.logger.error(err) )
  }

  getProjectById(id:string) {
    const refProject = this.fireBase.database.ref(`projects/${id}`);

    return new Promise((resolve, reject) => {
      refProject.once('value')
      .then( snapshot => {
        const projectData = snapshot.val();
        projectData.id=snapshot.key;
        resolve(new Project(projectData, this.logger));
      }, err => reject(err))
    });
  }

  getEmailByProject(project: Project) {
    const userId = project.data.user;

    return new Promise((resolve, reject) => {
      this.fireBase.database
        .ref(`users/${userId}/email`)
        .once('value')
        .then(snapshot => resolve(snapshot.val()))
    });
  }

  updateProject(project:any, value: Object) {
    // Update the firebase entry property for a given project
    return new Promise((resolve, reject) => {
      const ref = this.fireBase.database.ref(`projects/${project.data.id}`);
      ref.update(value)
        .then(resolve(project), reject);
    });
  }

  setProjectProperty(projectId, property, value) {
    const refProject = this.fireBase.database.ref(`projects/${projectId}`);
    return refProject.child(property).set(value);
  }

  removeProjectProperty(projectId: string, property: string) {
    return this.fireBase.database.ref(`projects/${projectId}/${property}`).remove();
  }

  setProjectProperties(projectId, properties) {
    const refProject = this.fireBase.database.ref(`projects/${projectId}`);
    return this.setReferenceData(refProject, properties);
  }

  setReferenceData(firebaseRef, data) {
    // recursively update the properties of the data object on the firebase reference
    // the update operation is destructive when used with nested object values
    let arrPromises = [];

    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        // prop has value 
        const prop = i;
        const val = data[i];
        (typeof val === 'object') ? this.setReferenceData(firebaseRef.child(i), val) : arrPromises.push(firebaseRef.child(i).set(val));
      }
    }
    return arrPromises;
  }
}