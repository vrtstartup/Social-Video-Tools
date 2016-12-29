import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Http, ResponseContentType } from '@angular/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
   selector:'preload-img',
   template:'<img [class.s-anno-template__thumb]="padding" [src]="src"/>'
})
export class PreloadImageComponent implements OnInit, OnChanges{

   @Input() srcStatic: string;
   @Input() srcAnimated: string;
   @Input() preview: boolean;
   @Input() padding: boolean;
   private src: SafeUrl;
   private objectUrl: SafeUrl;

   constructor(private http:Http, private sanitizer: DomSanitizer){}

    ngOnInit(){
      this.src = this.srcStatic;
      this.generateImage(this.srcAnimated);
    }

    ngOnChanges(changes: SimpleChanges) {
      if(changes.hasOwnProperty('preview')) this.src = this.preview ? this.objectUrl : this.srcStatic;
    }

   generateImage(url: any): void {
      this.http.get(this.srcAnimated, {responseType: ResponseContentType.Blob})
         .subscribe(response => {
            let urlCreator = window.URL;
            this.objectUrl = this.sanitizer.bypassSecurityTrustUrl(urlCreator.createObjectURL(response.blob()));
         });
    }
}