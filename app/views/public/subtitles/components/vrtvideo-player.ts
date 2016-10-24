import { Component, Input, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';

@Component({
    selector: 'vrtvideo-player',
    templateUrl: './vrtvideo-player.html'
})
export class VrtVideoPlayer implements OnInit, AfterViewInit, OnChanges {
    @Input() video;
    @Input() subAr;

    controls:boolean = false;
    autoplay:boolean = false;
    preload:string = 'auto';
    api:VgAPI;
    fsAPI:VgFullscreenAPI;

    constructor(api:VgAPI) {
        this.fsAPI = VgFullscreenAPI;

        this.api = api;
        console.log(api);
    }

    ngOnInit(){
    }
    
    ngAfterViewInit(){
    }

    ngOnChanges(){    
        let seektime = ( parseFloat(this.subAr[0].start) / parseFloat(this.video.movielength) * 100 ) ;
        this.api.seekTime( seektime, true ); // percentage
        this.api.play();
    }

    onPlayerReady() {
        // this.api = api;
        // this.api.seekTime( this.subMeta.start );
        // this.api.play();
    }

}
