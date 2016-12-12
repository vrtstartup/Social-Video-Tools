import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { AngularFire } from 'angularfire2'; // FirebaseAuth acts as our authentication service

@Injectable()
export class UserService {

    public user$: Observable<any>;

    constructor(private af: AngularFire) {
           
        this.user$ = this.af.auth.flatMap(auth => {
            if (!auth) {
                console.log('not authenticated');
                return Observable.create( observer => {
                    observer.next();
                    //observer.complete();
                    return false;
                });            
            }

            return this.af.database.object(`/users/${auth['uid']}`).map(userData => {
                userData.userID = auth.uid;
                userData.email = auth.auth.email;
                
                return userData;
            });
        });
    }

}