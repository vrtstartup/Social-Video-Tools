import { Component, OnInit, NgZone } from '@angular/core';
import { AngularFire, FirebaseAuth, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/upload.service';

// TODO remove | only for test purposes
import testTemplate from './testModels/testTemplate.model';
import annotationTemplate from './testModels/annotationTemplate.model';

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
  userMessage: string = '';
  authenticated: boolean;
  errorMessage: string;

  firebaseSelectedSubKey: string; // points to the firebase subtitle entry we're editing
  project: any; // this is the ngModel we use to update, receive and bind firebase data
  uploadProgress: any;
  downScaleProgress: any;

  constructor(
    private zone: NgZone,
    private http: Http,
    private uploadService: UploadService,
    af: AngularFire,
    public auth: FirebaseAuth) {

    this.af = af;
    // // General Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.projectsRef = af.database.list('/projects');
    this.templatesRef = af.database.object('/templates');

    // // TODO remove | only for test purposes
    // this.templatesRef.set(testTemplate);
  }

  authenticationStatus(status:boolean) {
    this.authenticated = status;
    this.errorMessage = null;
  }

  authenticationError(error) {
    this.errorMessage = error.message;
  } 

  logout(event) {
      this.auth.logout();
      this.authenticated = false; 
  }

  ngOnInit() {
    // subscribe to service observable
    this.uploadService.progress$
      .subscribe(data => {
        this.zone.run(() => {
          this.uploadProgress = data;
        });
      }, (err) => { console.log(err) });
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
    this.uploadService.makeFileRequest('api/upload/source', this.source, this.projectId)
      .subscribe(
        data => { },
        err => { console.log('err', err) }
      );
  }

  setSelectedAnnotation(annotation) {
    this.selectedAnnotation = annotation;
    // TODO reveal available templates (based on rights)
  }

  addAnnotation() {
    this.annotationsRef.push(annotationTemplate);
  }

  updateAnnotation($event) {
    this.selectedAnnotation = $event;
    this.annotationsRef.update($event.$key, { start: $event.start, end: $event.end });
  }

  addToRenderQueue() {
    this.http.post('api/render', { projectId: this.projectId })
      .subscribe((data) => { });
  }
}