import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from 'angularfire2';
import { HttpModule } from '@angular/http';
import { ExtBrowserXhr } from './common/extends/extBrowserXhr';

import { NgModule } from '@angular/core';
import { VgCore } from "videogular2/core";
import { VgControlsModule } from "videogular2/controls";
import { VgOverlayPlayModule } from "videogular2/overlay-play";
import { VgBufferingModule } from "videogular2/buffering";

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { VrtVideoPlayer } from "./views/public/subtitles/components/vrtvideo-player";

import { VrtAppsComponent } from './views/public/vrtapps.component';
import { SubtitlesComponent } from './views/public/subtitles/subtitles.component';
import { RangeSliderComponent } from './views/public/subtitles/components/range-slider.component';
import { listPipe } from './common/pipes/list.pipe';

@NgModule({
    declarations: [
        AppComponent,
        VrtVideoPlayer,
        VrtAppsComponent,
        SubtitlesComponent,
        RangeSliderComponent,
        listPipe
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
        AngularFireModule.initializeApp( process.env.FIREBASE ),
        RouterModule.forRoot([
            { path: 'subtitles', component: SubtitlesComponent },
            { path: '', component: SubtitlesComponent },
        ]),
    ],
    providers: [ExtBrowserXhr],
    bootstrap: [AppComponent],
})
export class AppModule {}
