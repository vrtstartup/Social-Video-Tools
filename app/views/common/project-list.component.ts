import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../common/services/project.service';
import { Project } from '../../common/models/project.model';
import { Http } from '@angular/http';
import { AngularFire, FirebaseListObservable} from 'angularfire2';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'project-list',
    templateUrl: './project-list.component.html',
})

export class ProjectListComponent implements OnInit {
  @Input() role: number;

  public projectsByUser: any;
  private projects: Array<Project>;
  public userEmail = '';

  constructor(
      private af:AngularFire,
      private projectService: ProjectService, 
      private router: Router,
      private http: Http
    ) {
      this.af = af;
      this.userEmail = 'joris.compernol@vrt.be';
  }

  ngOnInit(){
      // query by userId
      this.projectService.projectsByUser$.subscribe( projectsbyuser => {
        this.projects = projectsbyuser;
      })
      const userQuery = { 
        email: this.userEmail, 
        last: 10,
      };
      this.projectService.setUserQuerySubject(userQuery);
  }

  downloadFile(projectKey: string){
    location.href = `api/file/download/${projectKey}`;
  }

  open(projectId: string){ 
    //this.selectionUpdated.emit(projectId);
    this.router.navigateByUrl(`/projects/${projectId}`);
  }

  setUserByEmail(formdata) {
      // TODO check if email exists and inform user
      if(formdata.email === '') {
        // query all project if no email adress provided
        this.projectService.projects$.subscribe( projects => this.projects = projects )
        const usersQuery = {last: 30};
        this.projectService.setUsersQuerySubject(usersQuery);
        return
      }
      const userQuery = { 
        email: formdata.email, 
        last: 10,
      };
      this.projectService.setUserQuerySubject(userQuery);
  }

}