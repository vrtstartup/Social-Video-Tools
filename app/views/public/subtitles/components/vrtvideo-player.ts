import { Component, Input, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';

@Component({
    selector: 'vrtvideo-player',
    templateUrl: './vrtvideo-player.html'
})
export class VrtVideoPlayer implements OnInit, AfterViewInit, OnChanges {
    @Input() clip;
    @Input() selectedAnnotation;

    sources: Array<Object>;
    controls: boolean = false;
    autoplay: boolean = false;
    preload: string = 'auto';
    api: VgAPI;
    fsAPI: VgFullscreenAPI;

    constructor(api: VgAPI) {
        this.fsAPI = VgFullscreenAPI;
        this.api = api;
        this.sources = [];
    }

    ngOnInit() { 
    }
    ngAfterViewInit() { 
    }

    ngOnChanges() {

        console.log('event in child: video-player')

        if (this.clip) {
            this.clip.lowResUrl = this.clip.lowResUrl + Math.floor((Math.random() * 10) + 1)
            this.sources = [this.clip];
        }

        if (this.selectedAnnotation) {

            let seektime = parseFloat(this.selectedAnnotation.start);
            this.api.seekTime(seektime);
            this.api.play();
        }

    }

    onPlayerReady() {
        // console.log("player ready");
    }

}
