import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFire, FirebaseAuth, FirebaseAuthState, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/upload.service';
import { ListPipe } from '../../../common/pipes/list.pipe';
import { SortByPropPipe } from '../../../common/pipes/sortByProp.pipe';
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
  projectData: any;
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
          this.projectData = this.project.data;
        });

        // attach project id to user 
        this.af.database.object(`/users/${this.userId}/projects/${ref.key}`).set(true);

        // upload
        this.uploadSource($event, ref.key);
      })
      .catch(err => console.log(err, 'could not create|upload a new project'));
  }

  updateProject() {
    this.projectRef.update(this.projectData);
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
    this.uploadSource($event, this.projectData['$key']);
    // TODO optionally highlight out-of-range annotations
  }

  /* annotations -- */
  addAnnotation() {
    // create annotation object if none
    if (!this.projectData['annotations']) {
      this.projectData['annotations'] = {};
    }

    let strtTm = 0;
    let spanTm = 4;

    // if min one annotation
    if (Object.keys(this.projectData['annotations']).length > 0) {
      // object to array => sort => get one with highest end-value
      let annoArray = new ListPipe().transform(this.projectData['annotations']);
      let annoSorted = new SortByPropPipe().transform(annoArray, 'end');
      let annoLastEndtime = annoSorted[annoSorted.length -1 ]['end'] 
      
      strtTm = annoLastEndtime;
      const leftTm = this.projectData['clip']['movieLength'] - strtTm;

      if (leftTm <= spanTm) {
        strtTm = this.projectData['clip']['movieLength'] - spanTm;
      }
    }

    let endTm = strtTm + spanTm;
    let newId = this.makeid();
    let newAnno = {
      key: newId,
      start: strtTm,
      end: endTm,
      data: this.templates['subtitle'],
    };

    this.updateSelectedAnno(newId, newAnno);
  }

  setSelectedAnno(key) {
    this.selectedAnnotation = this.projectData['annotations'][`${key}`];
  }

  updateSelectedAnno(key, obj) {
    // update project | if key doesn't exists, its created this way
    this.projectData['annotations'][`${key}`] = obj;
    // update selectedAnnotation
    this.setSelectedAnno(key)
    this.updateProject();
  }

  deleteAnnotation(key) {
    // when you delete the selected
    if (this.selectedAnnotation.key === key) {
      this.selectedAnnotation = false;
    }
    delete this.projectData['annotations'][`${key}`];
    this.updateProject();
  }

  updateSelectedAnnoTemplate(template) {
    // only update if you select a different template for the annotation
    if (template.name != this.selectedAnnotation.data.name) {
      this.projectData['annotations'][`${this.selectedAnnotation.key}`]['data'] = template;
      this.setSelectedAnno(this.selectedAnnotation.key);
      this.updateProject();
    }
  }




  updateSelAnnoTextInput(event: any) {
    let value = event.target.value;
    // this.updateProject();
  }





  /* render ------- */
  addToRenderQueue() {
    this.http.post('api/render', { projectId: this.projectData['$key'] })
      .subscribe((data) => { });
  }

  /* helper functions -- */
  getLastObject(obj) {
    return obj[Object.keys(obj)[Object.keys(obj).length - 1]];
  }

  makeid() {
    return `-ANNO${Math.random().toString(22).substr(2, 15).toUpperCase()}`;
  }

}