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
    }

    ngOnInit(){}
    ngAfterViewInit(){}

    ngOnChanges(){
        let seektime = ( parseFloat(this.subAr[0].start) / parseFloat(this.video.movieLength) * 100 ) ;

        this.api.seekTime( seektime );
        this.api.play();
    }

    // ngDoCheck() {
    //     // check if the src property on the source element has changed
    //     if(this.video.currentSource != this.video.src){
    //         //  do something
    //         this.video.currentSource = this.video.src;
    //     }
    //  }

    // where is this being referenced?
    onPlayerReady() {
        // this.api = api;
        // this.api.seekTime( this.subMeta.start );
        // this.api.play();
        // this.video.currentSource = this.video.src;
    }

    // vgChangeSource() {
    //     console.log("TEST");
    // }

    // setVideo() {
    //     // this.api.stop();
    //     // this.
    // }

}
