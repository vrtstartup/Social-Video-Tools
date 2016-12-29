import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AngularFire } from 'angularfire2'; // FirebaseAuth acts as our authentication service

@Injectable()
export class UserService {

    public user$: Observable<any>;

    constructor(private af: AngularFire) {
           
        this.user$ = this.af.auth.flatMap(auth => {
            if (!auth) {
                return Observable.create( observer => {
                    observer.next();
                    //observer.complete();
                    return false;
                });            
            }

            // #todo ideally this returns a User object
            return this.af.database.object(`/users/${auth['uid']}`).map(userData => {
                userData.userID = auth.uid;
                userData.email = auth.auth.email;
                userData.verified = auth.auth.emailVerified;
                return userData;
            });
        });
    }

}