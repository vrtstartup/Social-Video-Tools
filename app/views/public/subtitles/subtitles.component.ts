import { Component, OnInit, NgZone } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/video.service';
import { getAnnotations, hasTitles } from '../../../common/services/project.service';

@Component({
  providers: [UploadService],
  selector: 'subtitles-component',
  templateUrl: 'subtitles.component.html',
})
export class SubtitlesComponent implements OnInit {

  snapshotRef: any;
  af: AngularFire;
  video: any;
  source: any;
  ffmpegQueueRef: FirebaseListObservable<any[]>;
  templaterQueueRef: FirebaseListObservable<any[]>;
  projectsRef: FirebaseListObservable<any[]>;
  projectRef: FirebaseObjectObservable<any[]>;
  projectId: string;
  annotationsRef: FirebaseListObservable<any[]>;

  firebaseSelectedSubKey: string; // points to the firebase subtitle entry we're editing
  project: any; // this is the ngModel we use to update, receive and bind firebase data
  uploadProgress: any;
  downScaleProgress: any;

  constructor(
    private zone: NgZone,
    private http: Http,
    private uploadService: UploadService,
    af: AngularFire){

    this.af = af;
    // General Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.projectsRef = af.database.list('/projects');
  }

  ngOnInit() {
    // subscribe to service observable
    this.uploadService.progress$
      .subscribe(data => {
        this.zone.run(() => {
          this.uploadProgress = data;
        });
      });
  }

  createNewProject($event) {
    // create new empty prject
    this.projectsRef.push('')
      .then((ref) => {
        // set references
        this.projectId = ref.key ;
        this.projectRef = this.af.database.object(ref.toString())
        this.annotationsRef = this.af.database.list(`${ref.toString()}/annotations`)
        //refProcess.child(ref.key)
        // upload
        this.uploadSource($event)
      })
      .catch( err => console.log(err, 'could not create|upload a new project'));
  }

  uploadSource($event) {
    // File-ref to upload
    this.source = $event.target.files[0];

    // Upload video
    this.uploadService.makeFileRequest('api/upload', this.source, this.projectId)
      .subscribe((data) => {
        // response holds link to lowres video source
        // #note: setting lowRes Url happens on server.ts/routes/upload
        // this.projectRef.update({ lowResUrl: data.lowResUrl });
      });
  }

  /*
  addSubtitle() {
    const ref = this.firebaseProject.child('subtitles').push({
      text: 'Dit is een test',
      start: '0.2',
      end: '1.2',
      options: {
        "fade": true,
        "size": 20
      }
    });

    // update the selected sub key
    this.firebaseSelectedSubKey = ref.key;
  }

    listen() {
      // when data in firebase updates, propagate it to our working model
      // only update the relevant nodes
      this.projectRef.on('child_changed', (snapshot) => {
        const child = snapshot.key;
        const data = snapshot.val();
        this.project[child] = data;
      });
    }
  
    // #todo write general update function instead of updateThis, updateThat...
    updateSubtitles(event) {
      const key = this.firebaseSelectedSubKey;
      this.projectRef.child('subtitles').child(key).update(event);
    }
  
    addSubtitle() {
      const ref = this.projectRef.child('subtitles').push({
        text: 'Dit is een test',
        start: '0.2',
        end: '1.2',
        options: {
          "fade": true,
          "size": 20
        }
      });
  
      // update the selected sub key
      this.firebaseSelectedSubKey = ref.key;
    }
  
    hasTitles() {
      // check wether or not this project containes titles
      let children = false;
  
      if (this.project.hasOwnProperty("titles")) {
        children = Object.keys(this.project.titles).length !== 0;
      }
  
      return children;
    }
  
    addToRenderQueue() {
      (this.hasTitles()) ? this.addToTemplaterQueue() : this.addToFFmpegQueue();
    }
  
    addToFFmpegQueue() {
      const key = this.projectRef.key;
      this.ffmpegQueueRef.push({
        projectId: key,
        operation: 'render',
        status: 'open',
      });
    }
  
    addToTemplaterQueue() {
      const key = this.projectRef.key;
      this.templaterQueueRef.push({
        projectId: key,
        status: 'open',
      });
    }
    */

}