import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../subtitles/models/user.model';
import { UsersService } from '../../../common/services/users.service';

@Component({
  providers: [UsersService],
  selector: 'users-component',
  templateUrl: './users.component.html',
})

export class UsersComponent implements OnInit, OnChanges {
  private users: Array<User>
  private possibleRoles: Array<string>

  constructor(private route: ActivatedRoute, private usersService: UsersService) {
    this.possibleRoles = ["user", "tester", "admin"];
  }

  ngOnInit(){ 
    console.log('users component loaded');
    console.log(this.usersService);
    this.usersService.users$.subscribe(this.handleUsers.bind(this));
  }

  ngOnChanges(changes: SimpleChanges){
    console.log(changes);
  }

  private echoUsers(){ 
    console.log(this.users);
  }

  private handleUsers( users:Array<User> ) {
    this.users = users;
    console.log(this.users);
  }

}