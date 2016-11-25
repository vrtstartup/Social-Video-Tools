import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'download-component',
  templateUrl: './download.component.html',
})

export class DownloadComponent implements OnInit {
  private projectId: string;
  public sources:Array<Object>;

  constructor(private route: ActivatedRoute) {
    this.projectId = decodeURIComponent( this.route.snapshot.params['id'] );

    this.sources = [
      {
        src: `video/${this.projectId}/out/render.mp4`,
        type: "video/mp4"
      },
    ];

  }

  ngOnInit(){

  }

  download() { window.location.href = `api/file/render/${this.projectId}`}

}