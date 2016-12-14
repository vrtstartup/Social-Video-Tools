import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../common/services/project.service';
import { Project } from '../../common/models/project.model';
import { Http } from '@angular/http';

@Component({
    selector: 'project-list',
    templateUrl: './project-list.component.html',
})

export class ProjectListComponent implements OnInit {
  @Input() role: number;
  private projects: Array<Project>;

  constructor(
      private projectService: ProjectService, 
      private router: Router,
      private http: Http) {
  }

  ngOnInit(){
      this.projectService.projects$.subscribe( projects => {
        this.projects = projects;
      })
  }

  downloadFile(projectKey: string){
    location.href = `api/file/download/${projectKey}`;
  }

  open(projectId: string){ 
    //this.selectionUpdated.emit(projectId);
    this.router.navigateByUrl(`/projects/${projectId}`);
  }
}