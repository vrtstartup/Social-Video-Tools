import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';

import * as $ from 'jquery';

@Component({
    selector: 'vrtvideo-player',
    templateUrl: './vrtvideo-player.html'
})
export class VrtVideoPlayer implements OnChanges, OnInit {
    @Input() previewTrigger;
    @Input() pausePlayTrigger;
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
    play: boolean;

    constructor() {
        this.fsAPI = VgFullscreenAPI;
        this.sources = [];
        this.currentTime = 1;
        this.apiLoaded = false;
        this.play = false; // keeps playing-state
    }

    ngOnInit() { }

    onPlayerReady(api: VgAPI) {
        this.api = api;
        this.apiLoaded = true;
    }

    ngOnChanges(changes: SimpleChanges) {

        //console.log('changes', changes);

        if (this.annotations && this.selectedAnnotationKey) {
            this.selectedAnnotation = this.annotations[this.selectedAnnotationKey];
        }

        if (this.apiLoaded) {

            if (changes.hasOwnProperty('previewTrigger')) {
                this.play = true ; //alway play on preview
                // prevent play()-pause() race-condition issue
                setTimeout(() => { this.api.seekTime(0), this.api.play() }, 200);
            }

            if (changes.hasOwnProperty('selectedAnnotationKey')) {
                this.togglePlay()

                this.api.seekTime(parseFloat(this.selectedAnnotation['start']));
                this.startPlaying();
                return
            }

            if (changes.hasOwnProperty('pausePlayTrigger')) {
                
                this.togglePlay()

                if (this.play) {
                    if(this.selectedAnnotationKey){
                        // if playhead is not between anno range set it
                        if( this.api.currentTime < parseFloat(this.selectedAnnotation.start || parseFloat(this.selectedAnnotation.end) > this.api.currentTime) ){
                            this.api.seekTime(parseFloat(this.selectedAnnotation['start'])); 
                        }
                        this.startPlaying(); 
                        return
                    } 
                    // prevent play()-pause() race-condition issue
                    setTimeout(() => this.api.play(), 200);

                } else {
                    this.api.pause() 
                }
            }
        }


        // sources update
        if (changes.hasOwnProperty('clip')) { // input 'clip' changed
            const prev = changes['clip']['previousValue'];
            const curr = changes['clip']['currentValue'];

            if (curr.hasOwnProperty('lowResUrl') && (!this.sources.length || curr['lowResUrl'] != this.sources[0]['lowResUrl'])) {
                this.sources = [this.clip];
            }
        }
    }

    togglePlay(){
        this.play = !this.play;
    }

    startPlaying() {
        // position the seek time according to the selected annotation
        // subscribe to seek time to reset seek position whenever it goes out of the bounds defined by the scrub handles
        this.currentTime = this.api.currentTime;

        setTimeout(() => this.api.play(), 200)


        // loop between scrub handles
        this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(() => {
            
            this.currentTime = Number(this.api.currentTime);

            if (this.selectedAnnotation) {
                if (this.api.currentTime >= parseFloat(this.selectedAnnotation.end)) {
                    this.api.seekTime(parseFloat(this.selectedAnnotation.start));
                    this.api.play();
                }
            }

        });
    }

    parseHtml(annotation) {

        // value in template e.g '<div>%keyValue%</div>' will be replaced by 
        //  the textvalue of corresponding keyValue

        if (annotation.data.text) {

            let parsedHtml = annotation.data.templateHtml;

            for (let i in annotation.data.text) {
                let input = '';
                input = annotation.data.text[i]['text'];
                parsedHtml = parsedHtml.replace(`%${i}%`, input);
            }

            let templateHtml = `<div>${annotation.data.templateCss}${parsedHtml}</div>`;

            // inject it
            $(`#${annotation.key} > div`).replaceWith(templateHtml);
        }

        // TODO for layers: replace html string with text values
        if (annotation.data.layer) { }
    }
}
