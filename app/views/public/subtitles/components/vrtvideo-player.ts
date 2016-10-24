import { Component, Input, OnInit, AfterViewInit, OnChanges } from '@angular/core';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';

@Component({
    selector: 'vrtvideo-player',
    templateUrl: './vrtvideo-player.html'
})
export class VrtVideoPlayer implements OnInit, AfterViewInit, OnChanges {
    @Input() video;
    @Input() subMeta;

    sources:Array<Object>;
    controls:boolean = false;
    autoplay:boolean = false;
    preload:string = 'auto';
    api:VgAPI;
    fsAPI:VgFullscreenAPI;

    constructor(api:VgAPI) {
        this.fsAPI = VgFullscreenAPI;
        this.api = api;
        this.sources = [];
    }

    ngOnInit(){}
    ngAfterViewInit(){}

    ngOnChanges(){
        if(this.video){
          this.sources = [this.video];
        }

        let seektime = ( parseFloat(this.subMeta.start) / parseFloat(this.subMeta.movielength) * 100 ) ;
        this.api.seekTime( seektime );
        // conflict
        // this.api.play();
    }

    onPlayerReady() {
        // console.log("player ready");
    }

}
