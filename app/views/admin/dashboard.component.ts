import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../common/services/user.service';

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
})

export class DashboardComponent implements OnInit {
  
  role: string

  constructor(private userService: UserService) {
  }

  ngOnInit(){
    this.userService.user$.subscribe(user => this.role = user.role);
  }

}