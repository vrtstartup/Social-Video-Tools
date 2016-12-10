import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFire, FirebaseApp, FirebaseAuth, FirebaseAuthState } from 'angularfire2';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
})

export class LoginComponent implements OnInit {

  private af;
  public activeFormGroup: string = 'loginForm';
  public fbAuth: any;
  private errorMessage: string;
  private loginForm: FormGroup;
  private registerForm: FormGroup;
  private requestPassForm: FormGroup;
  private registerFlag: Boolean = false;

  constructor(
    af: AngularFire,
    public auth: FirebaseAuth,
    private fb: FormBuilder,
    private router: Router,
    @Inject(FirebaseApp) firebaseApp: any) {
    this.af = af;
    this.fbAuth = firebaseApp.auth();
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

    this.requestPassForm = this.fb.group({
      email: ['', [ Validators.required, this.validateEmail]],
    });
      
    // optinally subscribe on changes
    this.loginForm.valueChanges.subscribe(value => {});
  }

  onSetActiveFromGroup(formGroupName) {
    // toggles visibility of different forms
    this.errorMessage = '';
    this.activeFormGroup = formGroupName;
  }

  validateEmail(fromControl: FormControl) {
    let EMAIL_REGEXP = /(.+)@(.+){2,}\.(.+){2,}/
    //let EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ;
    return EMAIL_REGEXP.test(fromControl.value) ? null : { validateEmail: { valid: false}};
  }

  login(event) {
    event.preventDefault();
    if(this.loginForm.valid) {
      this.errorMessage = '';
      const credentials = { email: this.loginForm.value.email, password: this.loginForm.value.password};

      this.auth.login(credentials)
        .then(user => this.router.navigate(['subtitles']))
        .catch(err => this.errorHandler(err))
    }
  }

  register(event) {
    event.preventDefault();
    if(this.registerForm.valid) {
      this.errorMessage = '';
      const credentials = { email: this.registerForm.value.email, password: this.registerForm.value.password};

      this.auth.createUser(credentials)
        .then(user => {
          this.af.database.object(`/users/${user.uid}/role`).set('user'); // set user role
          this.af.database.object(`/users/${user.uid}/email`).set(user.auth.email); //set user email
          this.router.navigate(['subtitles'])
        })
        .catch(err => this.errorHandler(err));
    }
  }

  requestPasswordResetEmail(event){
    event.preventDefault();
    if(this.requestPassForm.valid) {
      this.errorMessage = '';
      this.fbAuth.sendPasswordResetEmail(this.requestPassForm.value.email)
        .then( resp => {
          this.errorMessage = 'Sent successfully';
          setTimeout(() => {this.onSetActiveFromGroup('loginForm')}, 2000);
        })
        .catch( err => this.errorHandler(err))
    }
  }

  errorHandler(err) {
    if (err.code === 'auth/user-not-found') {
      this.errorMessage = 'Oops: We couldn\'t find that email address';
    } else if (err.code === 'auth/email-already-in-use') {
      this.errorMessage = 'This email is already in use';
    } else {
      this.errorMessage = 'authentication failed wrong';
    }
  }

}
