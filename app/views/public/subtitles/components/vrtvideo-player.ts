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
        // on setSelectedAnnotation & on rangeslider on('end')
        console.log('event in child: video-player')

        if (this.clip) {
            this.clip.lowResUrl = this.clip.lowResUrl + Math.floor((Math.random() * 10) + 1)
            this.sources = [this.clip];
        }

        if (this.selectedAnnotation) {
            
            let seekTime = parseFloat(this.selectedAnnotation.start);
            this.api.seekTime(seekTime);
            this.api.play();
            
            // loop function
            this.api.subscriptions.timeUpdate
                .subscribe(() => {
                    if( this.api.currentTime >= parseFloat(this.selectedAnnotation.end)) {
                        this.api.seekTime(parseFloat(this.selectedAnnotation.start))
                        this.api.play()
                    }
                })
        }

    }

    onPlayerReady() {
        // console.log("player ready");
    }
}
