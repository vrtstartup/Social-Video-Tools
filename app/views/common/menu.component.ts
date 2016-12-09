import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAuth } from 'angularfire2';

@Component({
    selector: 'menu-bar',
    templateUrl: './menu.component.html'
})

export class MenuComponent implements OnInit {

    showUserMenu: boolean = false;

    constructor(
        public router: Router,
        public auth: FirebaseAuth){}

    ngOnInit() {}

    onClickUserMenu() {
        this.toggleUserMenu();
    }
    
    toggleUserMenu(){
        this.showUserMenu = !this.showUserMenu;
    }

    logout(event) {
        this.toggleUserMenu();
        this.auth.logout();
        this.router.navigate(['/login']);
    }

}