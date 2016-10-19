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
        //console.log('onchange', this.subMeta);
        //console.log( parseFloat(this.subMeta.start) );
        let seektime = ( parseFloat(this.subMeta.start) / parseFloat(this.subMeta.movielength) * 100 ) ;
        //console.log(seektime);

        this.api.seekTime( seektime );
        this.api.play();
    }

    onPlayerReady() {
        // this.api = api;
        // console.log(api);
        // this.api.seekTime( this.subMeta.start );
        // this.api.play();
    }

}
