import { Project } from '../../common/classes/project';
import { db } from '../../common/services/firebase.service';

export class Projects {
  private logger;

  constructor(logger?: any) { 
    this.logger = logger ? logger : null;
  }

  getProjectByJob(job:any) {
    const refProject = db.ref(`projects/${job.id}`);

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
    const refProject = db.ref(`projects/${id}`);

    return new Promise((resolve, reject) => {
      refProject.once('value')
      .then( snapshot => {
        const projectData = snapshot.val();
        projectData.id=snapshot.key;
        resolve(new Project(projectData, this.logger));
      }).catch(reject);
    });
  }

  getEmailByProject(project: Project) {
    const userId = project.data.user;

    return new Promise((resolve, reject) => {
      db
        .ref(`users/${userId}/email`)
        .once('value')
        .then(snapshot => resolve(snapshot.val()))
    });
  }

  updateProject(project:any, value: Object) {
    // Update the firebase entry property for a given project
    return new Promise((resolve, reject) => {
      const ref = db.ref(`projects/${project.data.id}`);
      ref.update(value)
        .then(resolve(project), reject);
    });
  }

  setProjectProperty(projectId, property, value) {
    const refProject = db.ref(`projects/${projectId}`);
    return refProject.child(property).set(value);
  }

  removeProjectProperty(projectId: string, property: string) {
    return db.ref(`projects/${projectId}/${property}`).remove();
  }
}