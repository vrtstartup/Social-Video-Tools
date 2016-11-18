import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { FirebaseAuth, FirebaseAuthState } from 'angularfire2'; // FirebaseAuth acts as our authentication service 

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public auth: FirebaseAuth) {}

  canActivate() { return this.auth.getAuth() !== null; }
  
}