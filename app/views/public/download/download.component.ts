import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'download-component',
  templateUrl: './download.component.html',
})

export class DownloadComponent implements OnInit, OnDestroy {
  
  private sub: any;
  private projectId: string;
  public sources:Array<Object>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(){
    this.sub = this.route.params.subscribe(params => {
      this.projectId = params['id'];
      this.sources = [{ src: `video/${this.projectId}/out/render.mp4`, type: "video/mp4"}];
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  download() { window.location.href = `api/file/render/${this.projectId}`}
  
}