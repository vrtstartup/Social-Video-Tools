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

import{ routing } from './common/services/routing.service';
import { ProjectService } from './common/services/project.service';
import { UserService } from './common/services/user.service';

// import firebaseConfig from './config/firebase.config';
import { RoleGuard } from './common/guards/role.guard';

import { AppComponent } from './app.component';
import { LoginForm } from './views/public/auth/components/login/login-form';

import { SubtitlesComponent } from './views/public/subtitles/subtitles.component';
import { VrtVideoPlayer } from "./views/public/subtitles/components/vrtvideo-player";
import { OpenComponent } from './views/public/subtitles/components/open.component';
import { ProgressComponent } from './views/public/subtitles/components/progress.component';
import { ProgressBarComponent } from './views/public/subtitles/components/progressbar.component';
import { RangeSliderComponent } from './views/public/subtitles/components/range-slider.component';
import { AuthComponent } from './views/public/auth/authentication.component';
import { DownloadComponent } from './views/public/download/download.component';
import { DashboardComponent } from './views/admin/dashboard.component';
import { UsersComponent } from './views/admin/users.component';
import { ProjectsComponent } from './views/public/subtitles/components/projects.component';
import { ProjectListComponent } from './views/common/project-list.component';
import { MenuComponent } from './views/common/menu.component';
import { AdminMenuComponent } from './views/public/partials/adminMenu.component';

// currently only used for mdicon
import { MaterialModule } from '@angular/material';
import 'hammerjs';

import { ListPipe } from './common/pipes/list.pipe';
import { SortByPropPipe } from './common/pipes/sortByProp.pipe';
import { KeysPipe } from './common/pipes/keys.pipe';

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
        SubtitlesComponent,
        OpenComponent,
        ProgressComponent,
        ProgressBarComponent,
        AuthComponent,
        DownloadComponent,
        DashboardComponent,
        UsersComponent,
        ProjectsComponent,
        ProjectListComponent,
        AdminMenuComponent,
        MenuComponent,
        RangeSliderComponent,
        LoginForm,
        ListPipe,
        SortByPropPipe,
        KeysPipe,
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
        AngularFireModule.initializeApp( firebaseAppConfig, firebaseAuthConfig  ),
        routing,
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [ExtBrowserXhr, ProjectService, UserService, RoleGuard],
    bootstrap: [AppComponent],
})
export class AppModule {}
