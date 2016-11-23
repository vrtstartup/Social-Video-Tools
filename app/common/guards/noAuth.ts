import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { FirebaseAuth, FirebaseAuthState } from 'angularfire2'; // FirebaseAuth acts as our authentication service 

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(
    public auth: FirebaseAuth, 
    private router: Router) {}

  canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot): Observable<boolean>|boolean{ 
    return this.auth.map( (auth) => {
      if(auth){ 
        this.router.navigateByUrl('/'); 
        return false; 
      }

      return true;
    }).first();
  }
}