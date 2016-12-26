import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../../../../common/models/project.model';

@Component({
  selector: 'progress-dialog',
  templateUrl: './progress.component.html',
})

export class ProgressComponent implements OnInit {

  @Input() project: Project;
  @Input() uploadProgress: any;

  constructor() {}

  ngOnInit(){ console.log(this.project); }


}