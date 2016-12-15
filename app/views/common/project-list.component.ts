import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../common/services/project.service';
import { Project } from '../../common/models/project.model';
import { Http } from '@angular/http';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'project-list',
  templateUrl: './project-list.component.html',
  host: {
    '(document:click)': 'onClick($event)',
  },
})

export class ProjectListComponent implements OnInit {
  @Input() role: number;

  public projectsByUser: any;
  private projects: Array<Project>;
  public userEmail = '';
  private activeExtra: any;

  constructor(
    private http: Http,
    private af: AngularFire,
    private _el: ElementRef,
    private router: Router,
    private projectService: ProjectService,
  ) {
    this.af = af;
    this.userEmail = 'joris.compernol@vrt.be';
  }

  ngOnInit() {
    // query by userId
    this.projectService.projectsByUser$.subscribe(projectsbyuser => {
      this.projects = projectsbyuser;
    })
    const userQuery = {
      email: this.userEmail,
      last: 10,
    };
    this.projectService.setUserQuerySubject(userQuery);
  }

  downloadFile(projectKey: string) {
    location.href = `api/file/download/${projectKey}`;
  }

  open(projectId: string) {
    //this.selectionUpdated.emit(projectId);
    this.router.navigateByUrl(`/projects/${projectId}`);
  }

  deleteProject(projectKey: string) {
    this.activeExtra = false;
    const userId = this.projects.find(i => i.key == projectKey).data.user
    this.projectService.deleteProject(projectKey, userId);
  }

  setUserByEmail(formdata) {
    // TODO check if email exists and inform user
    if (formdata.email === '') {
      // query all project if no email adress provided
      this.projectService.projects$.subscribe(projects => this.projects = projects)
      const usersQuery = { last: 30 };
      this.projectService.setUsersQuerySubject(usersQuery);
      return
    }
    const userQuery = {
      email: formdata.email,
      last: 10,
    };
    this.projectService.setUserQuerySubject(userQuery);
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