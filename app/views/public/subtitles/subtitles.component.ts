import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFire, FirebaseAuth, FirebaseAuthState, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/upload.service';

// TODO remove | only for test purposes
import testTemplate from './models/testTemplate.model';

@Component({
  providers: [UploadService],
  selector: 'subtitles-component',
  templateUrl: 'subtitles.component.html',
})

export class SubtitlesComponent implements OnInit {

  userId: string;
  userMessage: string = '';
  uploadProgress: any;
  downScaleProgress: any;

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
  templates: any[];
  selectedAnnotation: any;
  selectedTemplate: any;

  constructor(
    private zone: NgZone,
    private http: Http,
    private uploadService: UploadService,
    private router: Router,
    af: AngularFire,
    public auth: FirebaseAuth) {

    this.af = af;
    // General Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.projectsRef = af.database.list('/projects');
    this.templatesRef = af.database.object('/templates');
    this.templatesRef.subscribe((s:any) => this.templates = s)
    
    // TODO remove | only for test purposes
    this.templatesRef.set(testTemplate);
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
      }, err => console.log(err));

      this.af.auth.subscribe(this.onAuthStatusChange.bind(this))
  }

  onAuthStatusChange(state:FirebaseAuthState) {
    if(state !== null) this.userId = state.uid;
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

        this.annotationsRef = this.af.database.list(`${ref.toString()}/annotations`, 
        { query: { orderByChild: 'end'}})
        this.annotationsRef.subscribe( (s:any) => this.annotations = s)

        // attach project id to user 
        this.af.database.object(`/users/${this.userId}/projects/${this.projectId}`).set(true);
          
        this.clipRef = this.af.database.object(`${ref.toString()}/clip`)
        this.clipRef.subscribe( (s:any) => this.clip = s ) 

        // upload
        this.uploadSource($event)
      })
      .catch( err => console.log( err, 'could not create|upload a new project'));
  }

  uploadSource($event) {
    // file-ref to upload
    let source = $event.target.files[0];
    // upload video
    this.uploadService.makeFileRequest('api/upload/source', source, this.projectId)
      .subscribe(
        data => { this.userMessage = '' },
        err => {
          console.log('error: makeFileRequest:', err)
          this.userMessage = 'your video has not been uploaded, contact the admin & grab a coffee';
        }
      )
  }

  updateSource($event) {
    this.uploadSource($event)
    // TODO optionally highlight out-of-range annotations
  }

  setSelectedAnnotation(annotation) {
    this.selectedAnnotation = annotation;
    this.setSelectedTemplate( this.templates[annotation.data.name])
    // TODO reveal available templates (based on rights)
  }

  addAnnotation() {
    let spanTm = 4 
    let strtTm = 0

    if( this.annotations.length > 0){
      strtTm = this.annotations[(this.annotations.length -1)].end
      const leftTm = this.clip['movieLength'] - strtTm

      if( leftTm <= spanTm) {
        strtTm = this.clip['movieLength'] - spanTm
      } 
    }

    let endTm = strtTm + spanTm

    // add new anno
    this.annotationsRef
      .push({ 
        start: strtTm, 
        end: endTm, 
        data: this.templates['subtitle']
      })
      .then((ref) => {
          let freshAnno = this.annotations[(this.annotations.length -1)]
          this.setSelectedAnnotation(freshAnno)
          this.setSelectedTemplate(this.templates['subtitle'])
        }
      )
  }

  updateAnnotation($event) {
    this.selectedAnnotation = $event;
    this.annotationsRef.update($event.$key, { start: $event.start, end: $event.end});
  }

  deleteAnnotation(id) {
    this.annotationsRef.remove(id) 
  }

  setSelectedTemplate(template) {
    // pass item in this.templates
    this.selectedTemplate = template
    // update the selected annotation with selected template
    if( this.selectedAnnotation){
      this.annotationsRef
        .update(this.selectedAnnotation.$key, { data: template})
    }
  }

  addToRenderQueue() {
    this.http.post('api/render', { projectId: this.projectId })
      .subscribe((data) => {});
  }
}