import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../common/services/project.service';
import { Project } from '../../common/models/project.model';
import { Http } from '@angular/http';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../../common/services/user.service';

@Component({
  selector: 'project-list',
  templateUrl: './project-list.component.html',
  host: {
    '(document:click)': 'onClick($event)',
  },
})

export class ProjectListComponent implements OnInit {
  
  private role: number;
  private projectsByUser: any;
  private userEmail = '';
  private projects: Array<Project>;
  private activeExtra: any;
  private userSub: any;
  private projectsByUserSub: any;
  private projectsSub: any;

  constructor(
    private http: Http,
    private af: AngularFire,
    private _el: ElementRef,
    private router: Router,
    private projectService: ProjectService,
    private userService: UserService
  ) {
    this.af = af;
    this.userEmail = '';
  }

  ngOnInit() {
    // subscribe to user$
    this.userSub = this.userService.user$.subscribe( user => {
        if(user){
          this.userEmail = user['email'];
          this.queryUserByEmail({email: this.userEmail});
          this.role = user['role'];
        }  
      }, err => console.log('authserviceErr', err)
     );

    // subsribe to projects$
    this.projectsSub = this.projectService.projects$.subscribe(projects => {
      this.projects = projects;
    })

    // subsribe to projectsByUser$
    this.projectsByUserSub = this.projectService.projectsByUser$.subscribe(projectsbyuser => {
      // check TODO in projectService: .map triggers multiple times
      this.projects = projectsbyuser;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.projectsByUserSub.unsubscribe();
    this.projectsSub.unsubscribe();
  }

  queryUserByEmail(formdata) {
    // if email input is 'empty' => return all projects 
    if (formdata.email === '') {
      // query projects
      const projectsQuery = { last: 30};
      this.projectService.setUsersQuerySubject(projectsQuery);
      return
    }
    // query projectsByUser
    const userQuery = { email: formdata.email, last: 10};
    this.projectService.setUserQuerySubject(userQuery);
  }

  downloadFile(projectKey: string) {
    location.href = `api/file/download/${projectKey}`;
  }

  open(projectId: string) {
    this.router.navigateByUrl(`/projects/${projectId}`);
  }

  deleteProject(projectKey: string) {
    const userId = this.projects.find(i => i.key == projectKey).data.user
    this.projectService.deleteProject(projectKey, userId);
    this.activeExtra = false;
  }

  showExtra(key) {
    this.activeExtra = key;
  }

  onClick(event) {
    if (this.activeExtra && !this._el.nativeElement.querySelector(`#${this.activeExtra}`).contains(event.target)) {
      this.activeExtra = false;
    }
  }

}