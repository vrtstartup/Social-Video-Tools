import { Component, Input, Output, EventEmitter, OnInit, ElementRef, OnChanges } from '@angular/core';

//import { ElementRef } from '@angular/core';
//import * as $ from 'jquery';

const noUiSlider = require('nouislider');

@Component({
    selector: 'range-slider',
    template: `
    <div class="range-slider__wrapper">
        <div class="range-slider__value">{{selectedAnnotation.start}}|{{selectedAnnotation.end}}|{{clip.movielength}}</div> 
        <div id="range-slider"></div>
    </div>`,
})
export class RangeSliderComponent implements OnInit, OnChanges {
    @Input() clip: any;
    @Input() selectedAnnotation: any;
    @Output() change = new EventEmitter();

    rangeSlider: any;

    constructor(
        // private el: ElementRef
        ) {
        console.log('Constructor');
    }

    ngOnInit() {
        console.log('ngOnInit');
        // $( this.el.nativeElement ).find('button').on('click', function(){ alert('it works'); })

    }

    ngOnChanges() {
        console.log('change in noUiSlider');
        // everytime a new annotatin is selected change is detected
        if(!this.rangeSlider){
            this.rangeSlider = document.getElementById('range-slider');

            noUiSlider.create(this.rangeSlider, {
                start: [this.selectedAnnotation.start, this.selectedAnnotation.end],
                // step: 1,
                behaviour: 'drag',
                connect: true,
                range: { 'min': 0, 'max': parseFloat(this.clip.movieLength) },
                tooltips: true,
            });
        } 
        
        this.rangeSlider.noUiSlider.set([this.selectedAnnotation.start, this.selectedAnnotation.end])

        this.rangeSlider.noUiSlider.on('update', () => {

            this.selectedAnnotation.start = this.rangeSlider.noUiSlider.get()[0]
            this.selectedAnnotation.end = this.rangeSlider.noUiSlider.get()[1]

            this.change.emit(Object.assign({}, this.selectedAnnotation));
        });
        


        console.log('rangeslider exists:', this.rangeSlider)

        //console.log( 'this.rangeSlider.noUiSlider :', this.rangeSlider )
        //.set([this.selectedAnnotation.start, this.selectedAnnotation.end]);
        // Check on subtitle is selected/passed
        // if subtitle passed, set noUiSlider
        // on change update selected subtitle
    }
}


