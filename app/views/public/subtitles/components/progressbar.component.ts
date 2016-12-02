import { Component, Input } from '@angular/core';

// import { Router } from '@angular/router';
// import { ProjectService } from '../../../../common/services/project.service';


@Component({
  selector: 'progress-bar',
  templateUrl: './progressbar.component.html',
})

export class ProgressBarComponent {

  @Input() progress: number;
  @Input() task: string;
  constructor() {}


}