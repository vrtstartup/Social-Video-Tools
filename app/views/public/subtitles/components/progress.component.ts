import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../models/project.model';

// import { Router } from '@angular/router';
// import { ProjectService } from '../../../../common/services/project.service';


@Component({
  selector: 'progress-dialog',
  templateUrl: './progress.component.html',
})

export class ProgressComponent implements OnInit {

  @Input() project: Project;

  constructor() {}

  ngOnInit(){ console.log(this.project); }


}