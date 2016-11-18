import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFire, FirebaseAuth, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import 'rxjs/add/operator/take'
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/upload.service';

// TODO remove | only for test purposes
import testTemplate from './models/testTemplate.model';
import annotationTemplate from './models/annotationTemplate.model';

@Component({
  providers: [UploadService],
  selector: 'subtitles-component',
  templateUrl: 'subtitles.component.html',
})

export class SubtitlesComponent implements OnInit {

  userMessage: string = '';

  af: AngularFire;
  ffmpegQueueRef: FirebaseListObservable<any[]>;
  templaterQueueRef: FirebaseListObservable<any[]>;
  projectsRef: FirebaseListObservable<any[]>;
  projectRef: FirebaseObjectObservable<any[]>;
  projectId: string;
  annotationsRef: FirebaseListObservable<any[]>;
  annotations: any[];
  clipRef: FirebaseObjectObservable<any[]>;
  clip: any[];
  templatesRef: FirebaseObjectObservable<any[]>;
  selectedAnnotation: any;

  //firebaseSelectedSubKey: string; // points to the firebase subtitle entry we're editing
  project: any; // this is the ngModel we use to update, receive and bind firebase data
  uploadProgress: any;
  downScaleProgress: any;

  constructor(
    private zone: NgZone,
    private http: Http,
    private uploadService: UploadService,
    private router: Router,
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

  logout(event) {
      this.auth.logout();
      this.router.navigate(['auth']);
  }

  ngOnInit() {
    // subscribe to service observable
    this.uploadService.progress$
      .subscribe(data => {
        // trigger change
        this.zone.run(() => {
          this.uploadProgress = data;
        });
      }, (err) => { console.log(err)});
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

        this.annotationsRef = this.af.database.list(`${ref.toString()}/annotations`, { query: { orderByChild: 'end' } })
        this.annotationsRef.subscribe( (s:any) => this.annotations = s)

        this.clipRef = this.af.database.object(`${ref.toString()}/clip`)
        this.clipRef.subscribe( (s:any) => this.clip = s ) 
        // upload
        this.uploadSource($event)
      })
      .catch(err => console.log(err, 'could not create|upload a new project'));
  }

  uploadSource($event) {
    // File-ref to upload
    let source = $event.target.files[0];
    // Upload video
    this.uploadService.makeFileRequest('api/upload/source', source, this.projectId)
      .subscribe(
        data => { this.userMessage = '' },
        err => {
          console.log('error: makeFileRequest:', err)
          this.userMessage = 'your video has not been uploaded, contact the admin & grab a coffee';
        }
      );
  }

  updateSource($event) {
    // TODO optionally highlight out of range annotations
    this.uploadSource($event)
  }

  setSelectedAnnotation(annotation) {
    this.selectedAnnotation = annotation;
    // TODO reveal available templates (based on rights)
  }

  addAnnotation() {

    let startTime = 0;
    let timeSpan = 4;
    let endTime = startTime + timeSpan;

    if(this.annotations.length > 0){
      let maxTime = this.annotations[(this.annotations.length -1)].end
      let movieLength = this.clip['movieLength']

      if( (movieLength - maxTime) <= timeSpan ) {
        startTime = movieLength - timeSpan
        endTime = movieLength
      } else {
        startTime = maxTime
        endTime = startTime + timeSpan;
      }
    }

    this.annotationsRef.push({
      start: startTime,
      end: endTime
    })
    .then((ref) => {
        let freshAnno = this.annotations[(this.annotations.length -1)]
        this.setSelectedAnnotation( freshAnno )
      }
    )

  }

  updateAnnotation($event) {
    this.selectedAnnotation = $event;
    this.annotationsRef.update($event.$key, { start: $event.start, end: $event.end });
  }

  deleteAnnotation(id) {
    this.annotationsRef.remove(id) 
  }

  addToRenderQueue() {
    this.http.post('api/render', { projectId: this.projectId })
      .subscribe((data) => { });
  }
}