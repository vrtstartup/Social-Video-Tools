import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFire, FirebaseAuth, FirebaseAuthState, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/upload.service';
import { Project } from './models/project.model';

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
  projects: any[];
  projectRef: FirebaseObjectObservable<any[]>;
  project: any;
  selectedAnnotation: any;
  templatesRef: FirebaseObjectObservable<any[]>;
  templates: any[];
  selectedTemplate: any;

  constructor(
    af: AngularFire,
    private zone: NgZone,
    private http: Http,
    private router: Router,
    private uploadService: UploadService,
    public auth: FirebaseAuth) {

    this.af = af;
    // general Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.projectsRef = af.database.list('/projects');
    this.projectsRef.subscribe((s: any) => this.projects = s);
    this.templatesRef = af.database.object('/templates');
    this.templatesRef.subscribe((s: any) => this.templates = s);

    // TODO remove | only for test purposes | 
    // should only be set once => when server restarts
    this.templatesRef.set(testTemplate);
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

  /* auth --------- */
  logout(event) {
    this.auth.logout();
    this.router.navigate(['auth']);
  }

  onAuthStatusChange(state: FirebaseAuthState) {
    if (state !== null) this.userId = state.uid;
  }

  /* project ------ */
  createNewProject($event) {
    // reset some values
    this.selectedAnnotation = false;
    // create new empty project
    this.projectsRef.push({ user: this.userId })
      .then((ref) => {
      
        this.projectRef = this.af.database.object(ref.toString());
        this.projectRef.subscribe((s: any) => {
          // new project model
          this.project = new Project(s);
        });

        // attach project id to user 
        this.af.database.object(`/users/${this.userId}/projects/${ref.key}`).set(true);

        // upload
        this.uploadSource($event, ref.key);
      })
      .catch(err => console.log(err, 'could not create|upload a new project'));
  }

  updateProject() {
    this.projectRef.update(this.project.data);
  }

  /* upload ------- */
  uploadSource($event, key) {
    // file-ref to upload
    let source = $event.target.files[0];
    // upload video
    this.uploadService.makeFileRequest('api/upload/source', source, key)
      .subscribe(
      data => { this.userMessage = '' },
      err => {
        console.log('error: makeFileRequest:', err);
        this.userMessage = 'your video has not been uploaded, contact the admin & grab a coffee';
      }
      );
  }

  updateSource($event) {
    this.uploadSource($event, this.project.data['$key']);
  }

  /* annotations -- */
  addAnnotation() {
    let newAnno = this.project.addAnnotation( this.templates['subtitle']);
    this.updateSelectedAnno(newAnno.key, newAnno);
  }

  setSelectedAnno(key) {
    this.selectedAnnotation = this.project.setSelectedAnno(key);
  }

  updateSelectedAnno(key, obj) {
    this.project.updateSelectedAnno(key, obj);
    this.setSelectedAnno(key);
    this.updateProject();
  }

  deleteAnnotation(key) {
    // when you delete the selected
    if (this.selectedAnnotation.key === key) {
      this.selectedAnnotation = false;
    }
    delete this.project.data['annotations'][`${key}`];
    this.updateProject();
  }

  updateSelectedAnnoTemplate(template) {
    // only update if you select a different template for the annotation
    if (template.name != this.selectedAnnotation.data.name) {
      this.project.data['annotations'][`${this.selectedAnnotation.key}`]['data'] = template;
      this.setSelectedAnno(this.selectedAnnotation.key);
      this.updateProject();
    }
  }
  
  // TODO
  updateSelAnnoTextInput(event: any) {
    let value = event.target.value;
  }

  /* render ------- */
  addToRenderQueue() {
    this.http.post('api/render', { projectId: this.project.data['$key'] })
      .subscribe((data) => { });
  }

}