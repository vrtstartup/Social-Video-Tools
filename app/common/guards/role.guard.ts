import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import * as rx from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { FirebaseAuth, FirebaseAuthState, AngularFire } from 'angularfire2'; // FirebaseAuth acts as our authentication service
import { UserService } from '../services/user.service'; 

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    public auth: FirebaseAuth, 
    private router: Router,
    private userService: UserService ) {}

  canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot): Observable<boolean>|boolean{

    const allowedRoles = route.data['roles'];

    return this.userService.user$.map( userData => {
      if(userData && this.validateRole(userData, allowedRoles)) {
        return true;
      } 

      console.log(`incorrect userRole: (${allowedRoles})`)
      this.router.navigate(['/auth']);
      return false;
      
    }).first()
  }

  validateRole(userData:Object, allowedRoles): boolean { 
    // check if userData['role'] is allowed for this route
    return allowedRoles.includes(userData['role']);
  }
}