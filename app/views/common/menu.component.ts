import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAuth } from 'angularfire2';

@Component({
    selector: 'menu-bar',
    templateUrl: './menu.component.html',
    host: {
        '(document:click)': 'onClick($event)',
    },
})

export class MenuComponent implements OnInit {

    showUserMenu: boolean = false;

    constructor(
        public router: Router,
        public auth: FirebaseAuth,
        private _el: ElementRef) { }

    ngOnInit() { }

    onClickUserMenu() {
        this.toggleUserMenu();
    }

    toggleUserMenu() {
        this.showUserMenu = !this.showUserMenu;
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