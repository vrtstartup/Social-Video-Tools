import { Component, Input, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';

@Component({
    selector: 'vrtvideo-player',
    templateUrl: './vrtvideo-player.html'
})
export class VrtVideoPlayer implements OnInit, AfterViewInit, OnChanges {
    @Input() video;
    @Input() subMeta;

    controls:boolean = false;
    autoplay:boolean = false;
    preload:string = 'auto';
    api:VgAPI;
    fsAPI:VgFullscreenAPI;

    constructor() {
        this.fsAPI = VgFullscreenAPI;

    }

    ngOnInit(){

    }
    ngAfterViewInit(){

    }

    // ngOnChanges(changes: {[subMeta: any]: any} ){
    //     console.log( 'changes =', changes );
    // }

    onPlayerReady(api:VgAPI) {
        console.log('this.subMeta.start ====', this.subMeta)
        this.api = api;
        this.api.seekTime( this.subMeta.start );
        this.api.play();
    }

}
