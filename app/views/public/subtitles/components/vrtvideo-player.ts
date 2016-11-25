import { Component, Input, OnChanges } from '@angular/core';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';

@Component({
    selector: 'vrtvideo-player',
    templateUrl: './vrtvideo-player.html'
})
export class VrtVideoPlayer implements OnChanges {
    @Input() clip;
    @Input() selectedAnnotation;
    @Input() annotations;

    sources: Array<Object>;
    controls: boolean = false;
    autoplay: boolean = false;
    preload: string = 'auto';
    api: VgAPI;
    fsAPI: VgFullscreenAPI;
    currentTime: any;

    constructor(api: VgAPI) {
        this.fsAPI = VgFullscreenAPI;
        this.api = api;
        this.sources = [];
    }

    ngOnChanges() {
        // on setSelectedAnnotation & on rangeslider on('end')
        console.log('event in child: video-player')

        if (this.clip && (!this.sources.length || this.sources[0]['lowResUrl'] != this.clip['lowResUrl'] )) {
            if(this.sources.length){
                console.log('change source');
                console.log(this.sources[0]['lowResUrl'], this.clip['lowResUrl']);
            }
            
            // this.clip.lowResUrl = this.clip.lowResUrl + Math.floor((Math.random() * 10) + 1)
            this.sources = [this.clip];
        }

        if (this.selectedAnnotation) {
            
            // Give the timeout enough time to avoid the race conflict.
            setTimeout(() => { 
                let seekTime = parseFloat(this.selectedAnnotation.start);
                this.api.seekTime(seekTime);
                this.api.play();
            }, 150)

            // loop function
            this.api.subscriptions.timeUpdate
                .subscribe(() => {
                    
                    this.currentTime = this.api.currentTime;
                    
                    if (this.api.currentTime >= parseFloat(this.selectedAnnotation.end)) {
                        this.api.seekTime(parseFloat(this.selectedAnnotation.start));
                        this.api.play();
                    }
                })

        }
    }
}
