import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VgAPI, VgFullscreenAPI } from 'videogular2/core';

import * as $ from 'jquery';

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

    ngOnChanges(changes: SimpleChanges) {
        // on setSelectedAnnotation & on rangeslider on('end')
        // console.log('event in child: video-player')
        // console.log(changes);

        if (this.clip['lowResUrl'] && (!this.sources.length || this.sources[0]['lowResUrl'] != this.clip['lowResUrl'])) {
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
}
