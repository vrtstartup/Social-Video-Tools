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
  selectedAnnotationInputs: any;

  af: AngularFire;
  ffmpegQueueRef: FirebaseListObservable<any[]>;
  templaterQueueRef: FirebaseListObservable<any[]>;
  projectsRef: FirebaseListObservable<any[]>;
  projectRef: FirebaseObjectObservable<any[]>;
  project: any[];
  projectKey: string;
  annotationsRef: FirebaseListObservable<any[]>;
  annotations: any[];
  selectedAnnotationRef: FirebaseObjectObservable<any[]>;
  selectedAnnotation: any;
  selectedAnnotationTextInputRef: FirebaseListObservable<any[]>;
  selectedAnnotationTextInput: any;
  clipRef: FirebaseObjectObservable<any[]>;
  clip: any[];
  templatesRef: FirebaseObjectObservable<any[]>;
  templates: any[];
  selectedTemplate: any;
  selectedAnnoSubscription: any;

  constructor(
    private zone: NgZone,
    private http: Http,
    private uploadService: UploadService,
    private router: Router,
    af: AngularFire,
    public auth: FirebaseAuth) {

    this.af = af;
    // general Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.projectsRef = af.database.list('/projects');
    this.templatesRef = af.database.object('/templates');
    this.templatesRef.subscribe((s: any) => this.templates = s);

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
        // force to trigger change
        this.zone.run(() => this.uploadProgress = data);
      }, err => console.log(err));

    this.af.auth.subscribe(this.onAuthStatusChange.bind(this));
  }

  onAuthStatusChange(state: FirebaseAuthState) {
    if (state !== null) this.userId = state.uid;
  }

  createNewProject($event) {
    // reset some values
    this.selectedAnnotation = false;
    // create new empty project
    this.projectsRef.push({ user: this.userId })
      .then((ref) => {
        
        // TODO remove to service
        // set project-references
        this.projectKey = ref.key;
        this.projectRef = this.af.database.object(ref.toString());
        this.projectRef.subscribe((s: any) => { 
          this.project = s;
        });

        this.annotationsRef = this.af.database.list(`${ref.toString()}/annotations`, { query: { orderByChild: 'end' } });
        this.annotationsRef.subscribe((s: any) => {
          this.annotations = s;
        });

        // attach project id to user 
        this.af.database.object(`/users/${this.userId}/projects/${ref.key}`).set(true);

        this.clipRef = this.af.database.object(`${ref.toString()}/clip`);
        this.clipRef.subscribe((s: any) => {
           this.clip = s;
        });

        // upload
        this.uploadSource($event);
      })
      .catch(err => console.log(err, 'could not create|upload a new project'));
  }

  uploadSource($event) {
    // file-ref to upload
    let source = $event.target.files[0];
    // upload video
    this.uploadService.makeFileRequest('api/upload/source', source, this.projectKey)
      .subscribe(
      data => { this.userMessage = '' },
      err => {
        console.log('error: makeFileRequest:', err);
        this.userMessage = 'your video has not been uploaded, contact the admin & grab a coffee';
      }
      );
  }

  updateSource($event) {
    this.uploadSource($event);
    // TODO optionally highlight out-of-range annotations
  }

  addAnnotation() {
    let strtTm = 0;
    let spanTm = 4;

    if (this.annotations.length > 0) {
      strtTm = this.annotations[(this.annotations.length - 1)].end;
      const leftTm = this.clip['movieLength'] - strtTm;

      if (leftTm <= spanTm) {
        strtTm = this.clip['movieLength'] - spanTm;
      }
    }

    let endTm = strtTm + spanTm;

    // add new anno
    this.annotationsRef.push({ start: strtTm, end: endTm, data: this.templates['subtitle'] })
      .then((ref) => {
        let newAnno = this.annotations[(this.annotations.length - 1)];
        // set Refs
        this.setSelectedAnnotation(newAnno);
        this.setSelectedAnnotationTextInput(newAnno);
      });
  }

  // TODO reveal available templates (based on rights)
  setSelectedAnnotation(annotation) {
    // ref to selected annotation
    this.selectedAnnotationRef = this.af.database.object(`projects/${this.projectKey}/annotations/${annotation.$key}`)
    this.selectedAnnoSubscription = this.selectedAnnotationRef.subscribe((s: any) => {
      // issue-fix  when remove is triggerd on this.annotationsRef
      if(s['$value'] !== null ){
        this.selectedAnnotation = s;
        this.setSelectedAnnotationTextInput(s);
      } 
    })
  }

  setSelectedAnnotationTextInput(annotation) {
    // extra ref to point to Text Input
    if (annotation.data.text != null) {
      this.selectedAnnotationTextInputRef = this.af.database.list(`projects/${this.projectKey}/annotations/${annotation.$key}/data/text`);
      this.selectedAnnotationTextInputRef.subscribe((s: any) => {
        this.selectedAnnotationTextInput = s;
      })
    }
  }

  updateAnnotationTemplate(template) {
    // only update if you select a different template for the annotation
    if (template.name != this.selectedAnnotation.data.name) {
      this.annotationsRef.update(this.selectedAnnotation.$key, { data: template });
    }
  }

  updateSelAnnoTextInput(event: any, key) {
    let value = event.target.value;
    this.selectedAnnotationTextInputRef.update(key, { text: value });
  }

  updateAnnotation($event) {
    this.selectedAnnotation = $event;
    this.annotationsRef.update($event.$key, { start: $event.start, end: $event.end });
  }

  deleteAnnotation(annotation) {
    // when you delete the selected
    if (this.selectedAnnotation.$key === annotation.$key) {
      this.selectedAnnoSubscription.unsubscribe();
      this.selectedAnnotation = false;
      this.selectedAnnotationTextInput = false;
    }
    // triggers issue in selectedAnnotationRef
    this.annotationsRef.remove(annotation.$key)

  }

  addToRenderQueue() {
    this.http.post('api/render', { projectKey: this.projectKey })
      .subscribe((data) => { });
  }

}