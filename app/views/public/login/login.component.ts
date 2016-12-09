import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFire, FirebaseAuth, FirebaseAuthState } from 'angularfire2';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
})

export class LoginComponent implements OnInit {

  private af;
  private errorMessage: string;
  private loginForm: FormGroup;
  private registerForm: FormGroup;
  private registerFlag: Boolean = false;

  constructor(
    af: AngularFire,
    public auth: FirebaseAuth,
    private fb: FormBuilder,
    private router: Router) {
    this.af = af;
  }

  ngOnInit() { 
    // populate form
    this.loginForm = this.fb.group({
      email: ['', [ Validators.required, this.validateEmail]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [ Validators.required, this.validateEmail]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    }); 

    this.loginForm.valueChanges.subscribe(value => {
      console.log(this.loginForm)
      console.log(this.loginForm.controls);
    });

  }

  validateEmail(fromControl: FormControl) {
    let EMAIL_REGEXP = /(.+)@(.+){2,}\.(.+){2,}/
    //let EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ;
    return EMAIL_REGEXP.test(fromControl.value) ? null : { validateEmail: { valid: false}};
  }

  login(event) {
    event.preventDefault();
    const form = this.loginForm.value;
    const credentials = { email: form.email, password: form.password};

    this.auth.login(credentials)
      .then(user => this.router.navigate(['subtitles']))
      .catch(err => this.errorHandler(err))
  }

  onClickRegister() {
    this.registerFlag = !this.registerFlag;
  }

  register(event) {
    event.preventDefault();
    const form = this.registerForm.value;
    const credentials = { email: form.email, password: form.password};

    this.auth.createUser(credentials)
      .then(user => {
        this.af.database.object(`/users/${user.uid}/role`).set('user'); // set user role
        this.af.database.object(`/users/${user.uid}/email`).set(user.auth.email); //set user email
        this.router.navigate(['subtitles'])
      })
      .catch(err => this.errorHandler(err));
  }

  errorHandler(err) {
    if (err.code === 'auth/user-not-found') {
      this.errorMessage = err.message;
    } else if (err.code === 'auth/email-already-in-use') {
      console.log(err.message)
      this.errorMessage = 'You must provide a correct email and password';
    } else {
      console.log(err.message);
      this.errorMessage = 'authentication failed wrong';
    }
  }

}
