import { Component, OnInit, NgZone } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/video.service';

// TODO remove | only for test purposes
import testTemplate from './testTemplate.model';

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
  clipRef: FirebaseObjectObservable<any[]>;
  templatesRef: FirebaseObjectObservable<any[]>;
  selectedAnnotation: any;

  firebaseSelectedSubKey: string; // points to the firebase subtitle entry we're editing
  project: any; // this is the ngModel we use to update, receive and bind firebase data
  uploadProgress: any;
  downScaleProgress: any;

  constructor(
    private zone: NgZone,
    private http: Http,
    private uploadService: UploadService,
    af: AngularFire) {

    this.af = af;
    // General Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.projectsRef = af.database.list('/projects');
    this.templatesRef = af.database.object('/templates');
    
    // TODO remove | only for test purposes
    this.templatesRef.set(testTemplate);
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
    // reset some values
    this.selectedAnnotation = false; 
    // create new empty project
    this.projectsRef.push('')
      .then((ref) => {
        // set project-references
        this.projectId = ref.key;
        this.projectRef = this.af.database.object(ref.toString())
        this.annotationsRef = this.af.database.list(`${ref.toString()}/annotations`)
        this.clipRef = this.af.database.object(`${ref.toString()}/clip`)
        // upload
        this.uploadSource($event)
      })
      .catch(err => console.log(err, 'could not create|upload a new project'));
  }

  uploadSource($event) {
    // File-ref to upload
    this.source = $event.target.files[0];
    // Upload video
    this.uploadService.makeFileRequest('api/upload', this.source, this.projectId)
      .subscribe((data) => { });
  }

  addToRenderQueue() {
    this.http.post('api/render', { projectId: this.projectId })
      .subscribe((data) => {});
  }

  setSelectedAnnotation(annotation){
    this.selectedAnnotation = annotation;
    // reveal available templates (based on rights)
  }

  addAnnotation() {
    const annotationTemplate = {
      type: 'subtitle',
      start: '0.20',
      end: '1.20',
      data: '',
    }
    this.annotationsRef.push(annotationTemplate);
  }

  updateAnnotation(event) {
    this.annotationsRef.update(event.$key, { start: event.start, end: event.end});
  }



  /*
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
  
    hasTitles() {
      // check wether or not this project containes titles
      let children = false;
  
      if (this.project.hasOwnProperty("titles")) {
        children = Object.keys(this.project.titles).length !== 0;
      }
  
      return children;
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