import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { User } from '../../views/public/subtitles/models/user.model';
import { AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class UsersService{
    /*
    * map the AngularFire /projects stream to a new stream, which wraps the raw data
    * in Project()-class objects.
    */
    public users$: Observable<any>;

    constructor(private af:AngularFire) {
      this.users$ = af.database.list('/users').map(UserData => {
        const arrUsers: Array<User> = [];
        UserData.forEach(UserData => arrUsers.push(new User(UserData)));
        return arrUsers;
      });
    }
}