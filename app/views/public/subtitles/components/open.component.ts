import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../../../common/services/project.service';
import { Project } from '../models/project.model';

@Component({
  selector: 'open-dialog',
  templateUrl: './open.component.html',
})

export class OpenComponent implements OnInit {
  @Input() openedProject: Project;
  @Output() selectionUpdated = new EventEmitter();
  private projects: Array<Project>;

  constructor(private projectService: ProjectService, private router: Router) {
    projectService.projects$.subscribe(this.doThings.bind(this))
  }

  ngOnInit(){}

  ngOnChanges(){
    // console.log(this.openedProject);
  }

  doThings(projects:Array<Project>){
    this.projects = projects;
  }

  open(projectId: string){ 
    this.selectionUpdated.emit(projectId);
    this.router.navigateByUrl(`/subtitles/${projectId}`);
  }
}