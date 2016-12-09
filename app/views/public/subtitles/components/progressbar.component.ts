import { Component, Input } from '@angular/core';

@Component({
  selector: 'progress-bar',
  templateUrl: './progressbar.component.html',
})

export class ProgressBarComponent {

  @Input() progress: number;
  @Input() task: string;
  constructor() {}

}