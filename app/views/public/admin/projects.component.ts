import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'projects-component',
  templateUrl: './projects.component.html',
})

export class ProjectsComponent implements OnInit {

  constructor(private route: ActivatedRoute) {}

  ngOnInit(){ console.log('projects component loaded');}

}