import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { HttpModule } from '@angular/http';
import { ExtBrowserXhr } from './common/classes/extBrowserXhr';
import { NgModule } from '@angular/core';
import { VgCore } from "videogular2/core";
import { VgControlsModule } from "videogular2/controls";
import { VgOverlayPlayModule } from "videogular2/overlay-play";
import { VgBufferingModule } from "videogular2/buffering";

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { routing } from './common/services/routing.service';
import { ProjectService } from './common/services/project.service';
import { UserService } from './common/services/user.service';
import { HotkeyModule } from 'angular2-hotkeys';
//import { HotkeysService } from '../node_modules/angular2-hotkeys/src/services/hotkeys.service'

// import firebaseConfig from './config/firebase.config';
import { RoleGuard } from './common/guards/role.guard';

import { AppComponent } from './app.component';
import { LoginComponent } from './views/public/login/login.component';

import { ProjectComponent } from './views/public/project/project.component';
import { VrtVideoPlayer } from "./views/public/project/components/vrtvideo-player";
import { ProgressComponent } from './views/public/project/components/progress.component';
import { ProgressBarComponent } from './views/common/progressbar.component';
import { RangeSliderComponent } from './views/public/project/components/range-slider.component';
import { AdminComponent } from './views/admin/admin.component';
import { DashboardComponent } from './views/admin/dashboard.component';
import { UsersComponent } from './views/admin/users.component';
import { ProjectsComponent } from './views/public/projects/projects.component';
import { ProjectListComponent } from './views/common/project-list.component';
import { MenuComponent } from './views/common/menu.component';

// currently only used for mdicon
import { MaterialModule } from '@angular/material';
import 'hammerjs';

import { ExcludePipe } from './common/pipes/exclude.pipe';
import { ListPipe } from './common/pipes/list.pipe';
import { SortByPropPipe } from './common/pipes/sortByProp.pipe';
import { KeysPipe } from './common/pipes/keys.pipe';
import { ParseEmailPipe } from './common/pipes/parseEmail.pipe';

import { NgInitDir } from './common/directives/ngInit.directive';

declare var FIREBASE_CONFIG;

const firebaseAppConfig = FIREBASE_CONFIG;
const firebaseAuthConfig = {
    provider: AuthProviders.Custom,
    method: AuthMethods.Password
}

@NgModule({
    declarations: [
        AppComponent,
        VrtVideoPlayer,
        ProjectComponent,
        ProgressComponent,
        ProgressBarComponent,
        AdminComponent,
        DashboardComponent,
        UsersComponent,
        ProjectsComponent,
        ProjectListComponent,
        MenuComponent,
        RangeSliderComponent,
        LoginComponent,
        ExcludePipe,
        ListPipe,
        SortByPropPipe,
        KeysPipe,
        ParseEmailPipe,
        NgInitDir,
    ],
    imports: [
        [MaterialModule.forRoot()],
        BrowserModule, 
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        VgCore, 
        VgControlsModule, 
        VgOverlayPlayModule, 
        VgBufferingModule,
        HttpModule,
        AngularFireModule.initializeApp( firebaseAppConfig, firebaseAuthConfig),
        routing,
        HotkeyModule.forRoot(),
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [ExtBrowserXhr, ProjectService, UserService, RoleGuard],
    bootstrap: [AppComponent],
})
export class AppModule {}
