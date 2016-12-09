// import { Component, OnInit } from '@angular/core';
// import { FirebaseAuth, FirebaseAuthState } from 'angularfire2';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'authentication-component',
//   templateUrl: './authentication.component.html',
// })

// export class AuthComponent implements OnInit {

//   private authenticated: boolean;
//   private errorMessage: string;

//   constructor(public auth: FirebaseAuth, private router: Router) {

//   }

//   ngOnInit() {
//   }

//   authenticationStatus(status: boolean) {
//     this.authenticated = status;
//     this.errorMessage = null;
//   }

//   authenticationError(error) {
//     this.errorMessage = error.message;
//     console.log(error);
//   }
// }