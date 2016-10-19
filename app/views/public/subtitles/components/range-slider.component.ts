import { Component, Input, Output, EventEmitter, OnInit, ElementRef, AfterViewInit } from '@angular/core';

//import * as $ from 'jquery';

const noUiSlider = require('nouislider');

@Component({
    selector: 'range-slider',
    template: `
    <div class="range-slider__wrapper">
        <div class="range-slider__value">{{subMeta.start}}|{{subMeta.end}}|{{subMeta.movielength}}</div> 
        <div id="range-slider"></div>
    </div>`,
})
export class RangeSliderComponent implements OnInit, AfterViewInit {
    @Input() subMeta: any;
    @Output() change = new EventEmitter();

    rangeSlider: any;

    constructor(private el: ElementRef){
    }

    ngOnInit() {
        // $( this.el.nativeElement ).find('button').on('click', function(){ alert('it works'); })

        this.rangeSlider = document.getElementById('range-slider');

        noUiSlider.create(this.rangeSlider, {
            start: [ this.subMeta.start, this.subMeta.end ],
            // step: 1,
            behaviour: 'drag',
            connect: true,
            range: { 'min':  0, 'max':  this.subMeta.movielength },
            tooltips: true,
        });

        this.rangeSlider.noUiSlider.on('update', () => {

            this.subMeta.start = this.rangeSlider.noUiSlider.get()[0]
            this.subMeta.end = this.rangeSlider.noUiSlider.get()[1]

            this.change.emit(Object.assign({}, this.subMeta));
            
        });
    }

    ngAfterViewInit() {
    }
}


