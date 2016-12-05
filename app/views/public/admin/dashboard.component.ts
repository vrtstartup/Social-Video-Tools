import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
})

export class DashboardComponent implements OnInit {

  constructor(private route: ActivatedRoute) {}

  ngOnInit(){ console.log('dashboard component loaded');}

}