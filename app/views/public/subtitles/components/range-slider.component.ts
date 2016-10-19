import { Component, Input, OnInit, ElementRef, AfterViewInit } from '@angular/core';

//import * as $ from 'jquery';

const noUiSlider = require('nouislider');

@Component({
    selector: 'range-slider',
    template: `
    <div class="range-slider__wrapper">
        <div class="range-slider__value">{{subStart}}|{{subEnd}}</div> 
        <div id="range-slider"></div>
    </div>`,
})
export class RangeSliderComponent implements OnInit, AfterViewInit {
    @Input() subStart: number;
    @Input() subEnd: number;
    @Input() movieLength: number;

    rangeSlider: any;

    constructor(private el: ElementRef){
    }

    ngOnInit() {
        // $( this.el.nativeElement ).find('button').on('click', function(){ alert('it works'); })

        this.rangeSlider = document.getElementById('range-slider');

        noUiSlider.create(this.rangeSlider, {
            start: [ this.subStart, this.subEnd ],
            // step: 1,
            behaviour: 'drag',
            connect: true,
            range: { 'min':  0, 'max':  this.movieLength },
            tooltips: true,
        });

        this.rangeSlider.noUiSlider.on('update', () => {

            this.subStart = this.rangeSlider.noUiSlider.get()[0]
            this.subEnd = this.rangeSlider.noUiSlider.get()[1]
            
        });
    }

    ngAfterViewInit() {}
}


