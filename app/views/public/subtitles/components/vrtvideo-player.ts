import {Component} from '@angular/core';
import {VgAPI, VgFullscreenAPI} from 'videogular2/core';

@Component({
    selector: 'vrtvideo-player',
    templateUrl: './vrtvideo-player.html'
})
export class VrtVideoPlayer {
    video:{};
    controls:boolean = false;
    autoplay:boolean = false;
    loop:boolean = false;
    preload:string = 'auto';
    api:VgAPI;
    fsAPI:VgFullscreenAPI;

    constructor() {
        this.fsAPI = VgFullscreenAPI;

        this.video = { 
                src: "http://static.videogular.com/assets/videos/videogular.mp4",
                type: "video/mp4"
            };
    }

    onPlayerReady(api:VgAPI) {
        this.api = api;
    }

}
