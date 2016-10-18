import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { UploadService } from '../../../../common/services/videoUpload';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';

@Component({
    providers: [ UploadService ],
    selector: 'subtitles-component',
    templateUrl: 'subtitles.component.html',
})
export class SubtitlesComponent implements OnInit {
    uploadFile: any;
    projectId: string;
    toProcess: FirebaseListObservable<any[]>;

    constructor(
      private http: Http,
      private service: UploadService,
      af: AngularFire
    ) {
      // init AngularFire
      this.toProcess = af.database.list('/to-process');

      this.projectId = this.makeid();

      // subscribe to service observable
      this.service.progress$.subscribe(data => {
        console.log(`progress = ${data}`);
      });
    }

    ngOnInit() {
    console.log('init');
  }

  upload($event) {
    // store the new file 
    this.uploadFile = $event.target;

    // Post uploaded video
    this.service.makeFileRequest('http://localhost:8080/upload', this.uploadFile.files[0], this.projectId)
      .subscribe((data) => {
        console.log(data);
        this.queue(this.projectId);
      });

    this.projectId = this.makeid();
  }

  queue(id) {
    this.toProcess.push({ projectId: id });
  }

  makeid() {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for ( let i = 0; i < 16; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}
