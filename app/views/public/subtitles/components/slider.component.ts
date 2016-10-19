import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
//import * as $ from 'jquery';

//import noUiSlider from '../../../node_modules/nouislider/distribute/nouislider.js';
//import * as noUiSlider from 'nouislider';
const noUiSlider = require('nouislider');

import '../../../../node_modules/nouislider/distribute/nouislider.css';

//console.log('jquery =', $);
console.log('noUiSlider =', noUiSlider);

@Component({
    selector: 'jqtest',
    template: `
    <button>jQtest button</button><br>
    <div id="slider"></div>{{start}}|{{end}}
    `,
})
export class SliderComponent implements OnInit, AfterViewInit {
    
    start: any;
    end: any;
    theslider: any;
    test: any;

    constructor(private el: ElementRef){
        this.start
        this.end
        this.test
    }

    ngOnInit() {
        // $( this.el.nativeElement ).find('button').on('click', function(){
        //     alert('it works');
        // })
    }

    ngAfterViewInit() {

        this.test = document.getElementById('slider');

        noUiSlider.create(this.test, {
            start: [ 20, 60 ],
            step: 1,
            behaviour: 'drag',
            connect: true,
            range: { 'min':  0, 'max':  100 }
        });

        this.test.noUiSlider.on('update', () => {

            this.start = this.test.noUiSlider.get()[0]
            this.end = this.test.noUiSlider.get()[1]
            
        });

    }
}


