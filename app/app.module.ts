import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {VgCore} from "videogular2/core";
import {VgControlsModule} from "videogular2/controls";
import {VgOverlayPlayModule} from "videogular2/overlay-play";
import {VgBufferingModule} from "videogular2/buffering";

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { BoundPlayer } from "./views/public/subtitles/components/bound-player";
import { SimplePlayer } from "./views/public/subtitles/components/simple-player";

import { VrtAppsComponent } from './views/public/subtitles/components/vrtapps.component';
import { SubtitlesComponent } from './views/public/subtitles/components/subtitles.component';

import { AngularFireModule } from 'angularfire2';
import { HttpModule } from '@angular/http';
import {ExtBrowserXhr} from './common/extends/extBrowserXhr';

// Must export the config
export const firebaseConfig = {
  apiKey: 'AIzaSyD3BnxjYmXHrP7zUPn8PxXQ1H-SbEzZwsY',
  authDomain: 'localhost',
  databaseURL: 'https://socialvideotool.firebaseio.com',
  storageBucket: 'socialvideotool.appspot.com',
};

@NgModule({
    declarations: [
        AppComponent,
        BoundPlayer,
        SimplePlayer,
        VrtAppsComponent,
        SubtitlesComponent,
    ],
    imports: [
        BrowserModule, 
        FormsModule,
        NgbModule,
        VgCore, 
        VgControlsModule, 
        VgOverlayPlayModule, 
        VgBufferingModule,
        HttpModule,
        AngularFireModule.initializeApp(firebaseConfig),
        RouterModule.forRoot([
            { path: 'subtitles', component: SubtitlesComponent },
            { path: '', component: VrtAppsComponent },
        ]),
    ],
    providers: [ExtBrowserXhr],
    bootstrap: [AppComponent],
})
export class AppModule {}
