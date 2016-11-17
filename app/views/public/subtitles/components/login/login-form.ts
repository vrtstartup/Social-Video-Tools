import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFire, FirebaseAuth, FirebaseAuthState } from 'angularfire2';

@Component({
    selector: 'login-form',
    templateUrl: './login-form.html',
})

export class LoginForm implements OnInit {
    @Output() onAuthStatusChange = new EventEmitter<boolean>();
    @Output() onError = new EventEmitter();

    private loginForm;

    constructor(fb: FormBuilder, public auth: FirebaseAuth) {
      // populate form
      this.loginForm = fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required]
      });
    }

    ngOnInit() {
      // subscribe to auth event
      this.auth.subscribe(this.loginStatusChange.bind(this));
    }

    login(event) {
      event.preventDefault();
      const form = this.loginForm.value;

      // #todo filter user input
      this.auth.login({ email: form.email, password: form.password }).then(console.log, this.errorHandler.bind(this));
    }

    loginStatusChange(state:FirebaseAuthState) {
      const status = (state === null) ? false : true; 
      this.onAuthStatusChange.emit(status);
    }

    errorHandler(err){ 
      this.onError.emit(err);
    }

}
