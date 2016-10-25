import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/video.service';

@Component({
    providers: [ UploadService ],
    selector: 'subtitles-component',
    templateUrl: 'subtitles.component.html',
})
export class SubtitlesComponent implements OnInit {

    subAr: any = [
      { start: '0.2', end: '1.2' },
      ];
      
    video: any;

    uploadFile: any;
    firebaseToProcess: FirebaseListObservable<any[]>;
    firebaseProjects:  FirebaseListObservable<any[]>;
    firebaseProject: any;
    modelProject: any;

  constructor(
      private http: Http,
      private service: UploadService,
      af: AngularFire
    ) {
      // init AngularFire
      this.firebaseToProcess = af.database.list('/to-process');
      this.firebaseProjects = af.database.list('/projects');

      // subscribe to service observable
      this.service.progress$.subscribe(data => {
        //console.log(`progress = ${data}`);
      });
  }

  onChange(event) {}
  
  ngOnInit() {}

  newProject() {
    // Bound UI elements need to be initiated
    this.modelProject = {
      name: '',
      clip: {}
    };

    // store new project in Firebase
    this.firebaseProjects.push(this.modelProject).then((ref) => {
      this.firebaseProject = ref;
      this.listen();
    });
  }

  update() {
    // update firebase reference with local project model
    this.firebaseProject.update( this.modelProject );
  }

  listen() {
    this.firebaseProject.on('value', (snapshot) => {
      this.modelProject = snapshot.val();

      if(this.modelProject.status.downscaled) {
        // project has been downscaled, show video
        this.video = {
          src: this.modelProject.clip.lowResUrl,
          type: "video/mp4",
          loop: true,
          movieLength: parseFloat(this.modelProject.clip.movieLength)
        }
      }
    })
  }

  upload($event) {
    // store the new file 
    this.uploadFile = $event.target;

    // Post uploaded video
    this.service.makeFileRequest('http://localhost:8080/upload', this.uploadFile.files[0], this.firebaseProject.key)
      .subscribe((data) => {
        // response holds link to owres video source
        this.firebaseProject.child('clip').update({lowResUrl: data.lowResUrl});
      });
  }

  queue() {
    // add a project ID to the 'to-process' list
    const key = this.firebaseProject.key;
    this.firebaseToProcess.push({ projectId: key});
  }
}