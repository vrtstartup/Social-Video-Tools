import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit } from '@angular/core';

//import * as $ from 'jquery';

const noUiSlider = require('nouislider');

@Component({
    selector: 'range-slider',
    template: `
    <div class="range-slider__wrapper">
        <div class="range-slider__value">{{this.selectedAnnotation.start}} | {{this.selectedAnnotation.end}} | {{clip.movielength}}</div> 
        <div id="range-slider"></div>
    </div>`,
})
export class RangeSliderComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() clip: any
    @Input() selectedAnnotation: any
    @Output() changeAnno = new EventEmitter()

    rangeSlider: any;

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        // since AfterViewInit happens after the changedetection
        // we have access all to values from 'this.selectedAnnotation'
        // and pass them to the slider
        this.rangeSlider = document.getElementById('range-slider');

        noUiSlider.create(this.rangeSlider, {
            start: [this.selectedAnnotation.start, this.selectedAnnotation.end],
            range: { 'min': 0, 'max': parseFloat(this.clip.movieLength) },
            behaviour: 'drag',
            connect: true,
            tooltips: true,
            // step: 1,
        });

        this.rangeSlider.noUiSlider.on('end', () => {
            if (this.selectedAnnotation) {

                this.selectedAnnotation.start = parseFloat(this.rangeSlider.noUiSlider.get()[0])
                this.selectedAnnotation.end = parseFloat(this.rangeSlider.noUiSlider.get()[1])

                this.changeAnno.emit(Object.assign({}, this.selectedAnnotation))
            }
        });
    }

    ngOnChanges() {
        // resets when new 'this.selectedAnnotation' enters
        if (this.rangeSlider) {
            this.rangeSlider.noUiSlider.set([
                this.selectedAnnotation.start,
                this.selectedAnnotation.end
            ])
        }
    }

}


