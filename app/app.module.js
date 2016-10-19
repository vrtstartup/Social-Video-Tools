"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var platform_browser_1 = require('@angular/platform-browser');
var router_1 = require('@angular/router');
var forms_1 = require('@angular/forms');
var core_1 = require('@angular/core');
var core_2 = require("videogular2/core");
var controls_1 = require("videogular2/controls");
var overlay_play_1 = require("videogular2/overlay-play");
var buffering_1 = require("videogular2/buffering");
var ng_bootstrap_1 = require('@ng-bootstrap/ng-bootstrap');
var app_component_1 = require('./app.component');
var bound_player_1 = require("./views/public/subtitles/components/bound-player");
var simple_player_1 = require("./views/public/subtitles/components/simple-player");
var vrtapps_component_1 = require('./views/public/subtitles/components/vrtapps.component');
var subtitles_component_1 = require('./views/public/subtitles/components/subtitles.component');
var angularfire2_1 = require('angularfire2');
var http_1 = require('@angular/http');
var extBrowserXhr_1 = require('./common/extends/extBrowserXhr');
exports.firebaseConfig = {
    apiKey: 'AIzaSyD3BnxjYmXHrP7zUPn8PxXQ1H-SbEzZwsY',
    authDomain: 'localhost',
    databaseURL: 'https://socialvideotool.firebaseio.com',
    storageBucket: 'socialvideotool.appspot.com',
};
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            declarations: [
                app_component_1.AppComponent,
                bound_player_1.BoundPlayer,
                simple_player_1.SimplePlayer,
                vrtapps_component_1.VrtAppsComponent,
                subtitles_component_1.SubtitlesComponent,
            ],
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                ng_bootstrap_1.NgbModule,
                core_2.VgCore,
                controls_1.VgControlsModule,
                overlay_play_1.VgOverlayPlayModule,
                buffering_1.VgBufferingModule,
                http_1.HttpModule,
                angularfire2_1.AngularFireModule.initializeApp(exports.firebaseConfig),
                router_1.RouterModule.forRoot([
                    { path: 'subtitles', component: subtitles_component_1.SubtitlesComponent },
                    { path: '', component: vrtapps_component_1.VrtAppsComponent },
                ]),
            ],
            providers: [extBrowserXhr_1.ExtBrowserXhr],
            bootstrap: [app_component_1.AppComponent],
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map