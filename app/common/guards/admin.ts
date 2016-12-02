import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import * as rx from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { FirebaseAuth, FirebaseAuthState, AngularFire } from 'angularfire2'; // FirebaseAuth acts as our authentication service 

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    public auth: FirebaseAuth, 
    private router: Router,
    private af: AngularFire
    ) {}

  canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot): Observable<boolean>|boolean{ 
    return new Observable<boolean>(observer => {
      this.auth.subscribe( auth => {
        if(auth){
          this.af.database.object(`/users/${auth['uid']}`).subscribe( userData => {
            this.validateRole(userData, 'admin') ? observer.next(true) : observer.next(false);
          });
        }else observer.next(false)
      });
    }).first();
  }
  validateRole(userData:Object, role: string): boolean { return (userData['role'] === role) }
}