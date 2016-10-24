import { Component, Input, Output, EventEmitter, OnInit, ElementRef, AfterViewInit, OnChanges } from '@angular/core';

//import { ElementRef } from '@angular/core';
//import * as $ from 'jquery';

const noUiSlider = require('nouislider');

@Component({
    selector: 'range-slider',
    template: `
    <div class="range-slider__wrapper">
        <div class="range-slider__value">{{subAr[0].start}}|{{subAr[0].end}}|{{video.movielength}}</div> 
        <div id="range-slider"></div>
    </div>`,
})
export class RangeSliderComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() video: any;
    @Input() subAr: any;
    @Output() change = new EventEmitter();

    rangeSlider: any;

    constructor(
        // private el: ElementRef
        ){
    }

    ngOnInit() {
        // $( this.el.nativeElement ).find('button').on('click', function(){ alert('it works'); })

        this.rangeSlider = document.getElementById('range-slider');

        noUiSlider.create(this.rangeSlider, {
            start: [ this.subAr[0].start, this.subAr[0].end ],
            // step: 1,
            behaviour: 'drag',
            connect: true,
            range: { 'min':  0, 'max':  this.video.movielength },
            tooltips: true,
        });

        this.rangeSlider.noUiSlider.on('update', () => {

            this.subAr[0].start = this.rangeSlider.noUiSlider.get()[0]
            this.subAr[0].end = this.rangeSlider.noUiSlider.get()[1]

            this.change.emit(Object.assign({}, this.subAr[0]));
            
        });
        console.log( 'this.rangeSlider =', this.rangeSlider );
        console.log( 'this.rangeSlider.noUiSlider =', this.rangeSlider.noUiSlider );
    }

    ngAfterViewInit() {
    }

    ngOnChanges(){
        console.log('change');
        // Check on subtitle is selected/passed
        // if subtitle passed, set noUiSlider
        // on change update selected subtitle
    }
}


