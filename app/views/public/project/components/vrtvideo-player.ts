import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';

import * as $ from 'jquery';

@Component({
    selector: 'vrtvideo-player',
    templateUrl: './vrtvideo-player.html'
})
export class VrtVideoPlayer implements OnChanges, OnInit {
    @Input() clip;
    @Input() selectedAnnotationKey;
    @Input() annotations;

    sources: Array<Object>;
    controls: boolean = false;
    autoplay: boolean = false;
    preload: string = 'auto';
    api: VgAPI;
    apiLoaded: boolean;
    fsAPI: VgFullscreenAPI;
    currentTime: number;
    selectedAnnotation: any;

    constructor() {
        this.fsAPI = VgFullscreenAPI;
        this.sources = [];
        this.currentTime = 1;
        this.apiLoaded = false;
    }

    onPlayerReady(api:VgAPI) {
        this.api = api;
        this.apiLoaded = true;
        this.setSeekTime();
    }

    ngOnInit(){
        
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('change detected');

        if(this.selectedAnnotationKey && this.annotations){
            this.selectedAnnotation = this.annotations[this.selectedAnnotationKey];
            //console.log(changes);
        }

        this.setSeekTime()

        if(changes.hasOwnProperty('clip')) { // input 'clip' changed
            const prev = changes['clip']['previousValue'];
            const curr = changes['clip']['currentValue'];

            if(curr.hasOwnProperty('lowResUrl') && (!this.sources.length || curr['lowResUrl'] != this.sources[0]['lowResUrl'])){
                this.sources = [this.clip];
            }
        }

        if(changes.hasOwnProperty('selectedAnnotation') && changes['selectedAnnotation']['currentValue'] && this.apiLoaded) { // input 'selectedAnnotation' changed && VG api loaded?
            const prev = changes['selectedAnnotation']['previousValue'];
            const curr = changes['selectedAnnotation']['currentValue'];

            if(prev != null && curr !=null && prev['key'] != curr['key']) this.setSeekTime();
        } 

    }

    setSeekTime(){

        // position the seek time according to the selected annotation
        //  subscribe to seek time to reset seek position whenever it goes out of the bounds defined by the scrub handles 
        if(this.selectedAnnotation && this.apiLoaded) {
            let seekTime = Number(this.selectedAnnotation['start']);
            this.api.seekTime(seekTime);

            // loop between scrub handles
            this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(() => {
                this.currentTime = Number(this.api.currentTime);
                if (this.api.currentTime >= parseFloat(this.selectedAnnotation.end)) {
                    this.api.seekTime(parseFloat(this.selectedAnnotation.start));
                    this.api.play();
                }
            });
        }

    }

    parseHtml(annotation) {
        // value in template e.g '<div>%keyValue%</div>' will be replaced by 
        // the textvalue of corresponding keyValue

        // JSON.stringify(this.selectedAnnotation.data.text) !== JSON.stringify(annotation.data.text)
        if (annotation.data.text) {
            
            let parsedHtml = annotation.data.templateHtml;

            for(let i in annotation.data.text) {
                let input = '';
                input = annotation.data.text[i]['text'];
                parsedHtml = parsedHtml.replace(`%${i}%`, input);
            }
            
            let templateHtml = annotation.data.templateCss + parsedHtml;
            
            // inject it
            $(`#${annotation.key}`).replaceWith(templateHtml);
        }
        
        // for text: replace html string with text values
        if(annotation.data.layer){

        }
    }

    isEmptyObject(obj){ 
        return (typeof obj === 'object') ? (Object.keys(obj).length === 0) : true;
    }
}
