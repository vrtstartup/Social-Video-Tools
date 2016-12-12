import { Directive, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[ngInitDir]'
})
export class NgInitDir implements OnInit {
  @Input('ngInitDir') ngInitFn;
  
  ngOnInit() {
    if(this.ngInitFn) { this.ngInitFn(); }
  }

}