import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';

//import * as $ from 'jquery';
//import noUiSlider from '../../../node_modules/nouislider/distribute/nouislider.js';
//import * as noUiSlider from 'nouislider';

const noUiSlider = require('nouislider');

@Component({
    selector: 'range-slider',
    template: `
    <div class="range-slider__wrapper">
        <div id="range-slider"></div>
        {{start}}|{{end}}
    </div>`,
})
export class SliderComponent implements OnInit, AfterViewInit {
    
    start: any;
    end: any;
    rangeSlider: any;

    constructor(private el: ElementRef){
        this.start
        this.end
        this.rangeSlider
    }

    ngOnInit() {
        // $( this.el.nativeElement ).find('button').on('click', function(){ alert('it works'); })

        this.rangeSlider = document.getElementById('range-slider');

        noUiSlider.create(this.rangeSlider, {
            start: [ 20, 60 ],
            step: 1,
            behaviour: 'drag',
            connect: true,
            range: { 'min':  0, 'max':  100 }
        });

        this.rangeSlider.noUiSlider.on('update', () => {

            this.start = this.rangeSlider.noUiSlider.get()[0]
            this.end = this.rangeSlider.noUiSlider.get()[1]
            
        });
    }

    ngAfterViewInit() {}
}


