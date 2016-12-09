import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFire, FirebaseAuth, FirebaseAuthState } from 'angularfire2';

@Component({
  selector: 'login-form',
  templateUrl: './login-form.html',
})

export class LoginForm implements OnInit {
  @Output() onAuthStatusChange = new EventEmitter<boolean>();
  @Output() onError = new EventEmitter();

  private loginForm;
  private af;

  constructor(af: AngularFire, fb: FormBuilder, public auth: FirebaseAuth, private router: Router) {
    this.af = af;

    // populate form
    this.loginForm = fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() { 
    // #todo remove this, workaround broken register
    const credentialsA = { email: 'matthias.devriendt@vrt.be', password: 'test123' };
    this.register(credentialsA);
  }

  login(event) {
    event.preventDefault();
    const form = this.loginForm.value;
    const credentials = { email: form.email, password: form.password };

    this.auth.login(credentials).then(
      (user) => { this.router.navigate(['subtitles']) },
      (err) => { this.errorHandler(err, credentials) }
    ).catch(err => console.log(err));
  }

  register(credentials) {
    if (credentials.email.indexOf('@vrt') > -1) {
      this.auth.createUser(credentials)
        .then(user => {
          this.af.database.object(`/users/${user.uid}/role`).set('user'); // set user role
          this.af.database.object(`/users/${user.uid}/email`).set(user.auth.email); //set user email

          this.router.navigate(['subtitles'])
        }, this.registerHandler.bind(this))
        .catch(err => console.log(err));
    } else {
      this.registerHandler({ message: 'only @vrt addresses allowed, sorry!' });
    }
  }

  errorHandler(err, credentials) {
    if (err.code === 'auth/user-not-found') {
      this.register(credentials)

    } else {
      this.onError.emit(err)
    }
  }

  registerHandler(err) { this.onError.emit(err) }

}
