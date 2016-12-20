import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { Project } from '../models/project.model';
import { AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class ProjectService {
    /*
    * map the AngularFire /projects stream to a new stream, which wraps the raw data
    * in Project()-class objects.
    */
    public usersQuerySubject: Subject<any>;
    public userQuerySubject: Subject<any>;

    public projects$: Observable<any>;
    public projectsByUser$: Observable<any>;

    constructor(private af:AngularFire) {
      
      this.usersQuerySubject = new Subject();
      this.userQuerySubject = new Subject();

      // get ALL projects
      this.projects$ = af.database.list('/projects', {
        query: { 
          limitToLast: this.usersQuerySubject.map(d => {return d.last}),
        }
      })
      .map(projectsData => {
        const arrProjects: Array<Project> = [];
        projectsData.sort((a,b) => b.created - a.created ); // sort on creationdate
        projectsData.forEach(projectData => arrProjects.push(new Project(projectData)));
        return arrProjects;
      });

      // filter projects by USER
      this.projectsByUser$ = af.database.list(`/projects`, { 
        query: { 
          limitToLast: this.userQuerySubject.map(d => {return d.last}),
          orderByChild: 'createdBy',
          equalTo: this.userQuerySubject.map(d => {return d.email})
        }
      })
      .map(projectsData => {
        // TODO check why map function returns value for every found item (on second request)
        const arrProjects: Array<Project> = [];
        projectsData.sort((a,b) => b.created - a.created );
        projectsData.forEach(projectData => {
          arrProjects.push(new Project(projectData))
        });
        return arrProjects;
      });
    }

    setUsersQuerySubject(usersQuery){
      this.usersQuerySubject.next(usersQuery);      
    }
    
    setUserQuerySubject(userQuery){
      this.userQuerySubject.next(userQuery);
    }

    deleteProject(key, userId){
      const projectsList = this.af.database.list(`/projects/${key}`).remove();
      const projectsUserList = this.af.database.list(`/users/${userId}/projects/${key}`).remove();
    }
}