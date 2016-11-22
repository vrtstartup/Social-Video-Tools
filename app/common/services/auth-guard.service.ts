import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { FirebaseAuth, FirebaseAuthState } from 'angularfire2'; // FirebaseAuth acts as our authentication service 

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public auth: FirebaseAuth, 
    private router: Router) { }

  canActivate() {
    console.log('this.auth.getAuth() =', this.auth.getAuth())
    if (this.auth.getAuth() !== null) {
      return true;
    } 
    console.log('token expired');
    this.router.navigate(['/']);
    return false;
  }

}