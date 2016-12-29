import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFire, FirebaseApp, FirebaseAuth, FirebaseAuthState } from 'angularfire2';
import { BrandService} from '../../../common/services/brands.service'
import { Brand } from '../../../common/models/brand.model';

@Component({
  providers: [BrandService],
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
  private possibleBrands: Array<Brand>;
  private brandSub: any;
  private showRegistrationForm: boolean;
  private registerButtonText: string; 

  constructor(
    af: AngularFire,
    public auth: FirebaseAuth,
    private fb: FormBuilder,
    private router: Router,
    private BrandService: BrandService,
    @Inject(FirebaseApp) firebaseApp: any) {
    this.af = af;
    this.fbAuth = firebaseApp.auth();
    this.showRegistrationForm = true;
    this.registerButtonText = 'Create Account';
    this.possibleBrands = [];    
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

    this.brandSub = this.BrandService.brands$.subscribe(this.brandsHandler.bind(this), this.errorHandler);
  }

  onSetActiveFromGroup(formGroupName) {
    // toggles visibility of different forms
    this.showRegistrationForm = true;
    this.registerButtonText = 'Create Account';
    this.errorMessage = '';
    this.activeFormGroup = formGroupName;
  }

  validateEmail(fromControl: FormControl) {
    let EMAIL_REGEXP = /(.+)@vrt.be/
    return EMAIL_REGEXP.test(fromControl.value) ? null : { validateEmail: { valid: false}};
  }

  login(event) {
    event.preventDefault();
    if(this.loginForm.valid) {
      this.errorMessage = '';
      const credentials = { email: this.loginForm.value.email, password: this.loginForm.value.password};

      this.auth.login(credentials)
        .then(this.handleLoginSucess.bind(this))
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
          // store aditional user data in FireBase Property 
          this.af.database.object(`/users/${user.uid}/role`).set('0'); // set user role
          this.af.database.object(`/users/${user.uid}/email`).set(user.auth.email); //set user email
          
          if(this.possibleBrands.length > 0){
            this.af.database.object(`/users/${user.uid}/defaultBrand`).set(this.possibleBrands[0]['key']); 
          }else{
            console.log('No brands could be fetched, registering user without default brand');
          }

          // send account verification email
          user.auth.sendEmailVerification()
            .then(this.handleRegistrationSuccess.bind(this), this.errorHandler);
        })
        .catch(err => this.errorHandler(err));
    }
  }

  handleRegistrationSuccess(data) {
    this.showRegistrationForm = false; 
    this.errorMessage = 'Registration successful! Please check your inbox for our confirmation mail'
  }

  handleLoginSucess(user) {
    const verified = user.auth.emailVerified;

    if(verified) {
      this.router.navigateByUrl('/projects');
    }else{ 
      this.errorMessage = 'Seems this email hasn\'t been verified yet. Check your inbox for our confirmation mail' ;
      this.auth.logout();
    }
  }
  clickRegisterButton() { this.registerButtonText = 'Hold on...' }

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

  brandsHandler(brands: Array<Brand>){ this.possibleBrands = brands }

  errorHandler(err) {
    if (err.code === 'auth/user-not-found') {
      this.errorMessage = 'Oops: We couldn\'t find that email address';
    } else if (err.code === 'auth/email-already-in-use') {
      this.errorMessage = 'This email is already in use';
    } else {
      this.errorMessage = 'authentication failed! Something went terribly wrong.';
    }
  }

}
