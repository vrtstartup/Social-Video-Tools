import { Component, OnInit, ElementRef } from '@angular/core';
import * as jquery from 'jquery';

console.log(jquery);

@Component({
    selector: 'jqtest',
    template: `<button>check</button>`,
})
export class JqtestComponent implements OnInit {
    
    constructor(private el: ElementRef){
        }

    ngOnInit() {
        jquery( this.el.nativeElement ).find('button').on('click', function(){
            alert('it works');
        })
    }
}
