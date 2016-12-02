import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'admin-component',
  templateUrl: './admin.component.html',
})

export class AdminComponent implements OnInit {

  constructor(private route: ActivatedRoute) {}

  ngOnInit(){ console.log('admin component loaded');}

}