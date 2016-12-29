import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAuth } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { UserService } from '../../common/services/user.service';
import { User } from '../../common/models/user.model';

@Component({
    selector: 'menu-bar',
    templateUrl: './menu.component.html',
    host: {
        '(document:click)': 'onClick($event)',
    },
})

export class MenuComponent implements OnInit {

    showUserMenu: boolean = false;
    showMessageDialog: boolean = false;
    defaultMessage: string = 'your message goes here';
    message:string;
    userSub: any;
    user: User;
    messageSuccess: boolean;

    constructor(
        public router: Router,
        public auth: FirebaseAuth,
        private _el: ElementRef,
        private userService: UserService,
        private http: Http) { 
            this.message = this.defaultMessage;
            this.userSub = this.userService.user$.subscribe(this.handleUser.bind(this))
        }

    ngOnInit() { }

    ngOnDestroy(){ this.userSub.unsubscribe() }

    handleUser(user){ this.user = user }

    handleMessageResponse(response){ this.messageSuccess = true }

    onClickUserMenu() { this.toggleUserMenu() }

    toggleMessageDialog(){ 
        this.showMessageDialog = !this.showMessageDialog 
        this.messageSuccess = false
    }

    toggleUserMenu() { this.showUserMenu = !this.showUserMenu }

    setDefaultMessage(){ if(this.message === this.defaultMessage || !this.message) this.message = this.defaultMessage }

    clearMessage() { if(this.message === this.defaultMessage) this.message = ''}

    sendUserFeedback(){
        if(this.user) this.http.post('api/message/new', {
            message: this.message,
            email: this.user['email'],
            location: window.location.href
        }).subscribe(this.handleMessageResponse.bind(this));
    }

    logout(event) {
        this.toggleUserMenu();
        this.auth.logout();
        this.router.navigate(['/login']);
    }

    onClick(event) {
        if (!this._el.nativeElement.querySelector('#s-menubar-dropdown').contains(event.target)) {
            this.showUserMenu = false;
        }
    }

}