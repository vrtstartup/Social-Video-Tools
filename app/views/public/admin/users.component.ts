import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../subtitles/models/user.model';
import { UserService } from '../../../common/services/user.service';

@Component({
  providers: [UserService],
  selector: 'users-component',
  templateUrl: './users.component.html',
})

export class UsersComponent implements OnInit, OnChanges {
  private users: Array<User>
  private possibleRoles: Array<string>

  constructor(private route: ActivatedRoute, private userService: UserService) {
    this.possibleRoles = ["user", "tester", "admin"];
  }

  ngOnInit(){ 
    console.log('users component loaded');
    console.log(this.userService);
    this.userService.users$.subscribe(this.handleUsers.bind(this));
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