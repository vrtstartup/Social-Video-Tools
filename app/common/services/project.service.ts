import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Project } from '../../views/public/subtitles/models/project.model';
import { AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class ProjectService{
    /*
    * map the AngularFire /projects stream to a new stream, which wraps the raw data
    * in Project()-class objects.
    */
    public projects$: Observable<any>;

    constructor(private af:AngularFire) {
      this.projects$ = af.database.list('/projects').map(projectsData => {
        const arrProjects: Array<Project> = [];
        projectsData.forEach(projectData => arrProjects.push(new Project(projectData)));
        return arrProjects;
      });
    }
}