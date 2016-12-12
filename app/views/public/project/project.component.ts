import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { UploadService } from '../../../common/services/upload.service';
import { Project } from '../../../common/models/project.model';
import { UserService } from '../../../common/services/user.service';

import './project.component.scss';

// TODO remove | only for test purposes
import testTemplate from '../../../common/models/testTemplate.model';
import testStyles from '../../../common/models/testStyles.model';

@Component({
  providers: [UploadService],
  selector: 'project-component',
  templateUrl: './project.component.html',
})

export class ProjectComponent implements OnInit, OnDestroy {

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
  stylesRef: FirebaseObjectObservable<any[]>;
  templates: any[];
  selectedTemplate: any;
  projectId: string;

  //showOpenDialog: boolean;
  userSubscribtion: any;

  constructor(
    af: AngularFire,
    private zone: NgZone,
    private http: Http,
    private router: Router,
    private route: ActivatedRoute,
    private uploadService: UploadService,
    public userService: UserService) {

    this.af = af;

    // general Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.projectsRef = af.database.list('/projects');
    this.projectsRef.subscribe((s: any) => this.projects = s);
    this.templatesRef = af.database.object('/templates');
    this.templatesRef.subscribe((s: any) => this.templates = s);

    this.stylesRef = af.database.object('/styles');

    // interface
    //this.showOpenDialog = false;

    // TODO remove | only for test purposes | 
    // should only be set once => when server restarts
    this.templatesRef.set(testTemplate);
    this.stylesRef.set(testStyles);
  }

  ngOnInit() {
    this.userSubscribtion = this.userService.user$.subscribe( 
      data => this.userId = data.userID ,
      err => console.log('authserviceErr', err)
     );
    
    // subscribe to service observable
    this.uploadService.progress$
      .subscribe(data => {
        // force to trigger change
        this.zone.run(() => this.uploadProgress = data);
      }, err => console.log(err));

    this.projectId =  this.route.snapshot.params['id'];
    if(this.projectId) {
      this.openProject(this.projectId);
    }
  }

  ngOnDestroy(){
    this.userSubscribtion.unsubscribe();
  }

  /* project ------ */
  // createNewProject($event) {
  //   // reset some values
  //   this.selectedAnnotation = false;
  //   // create new empty project
  //   this.projectsRef.push({ user: this.userId })
  //     .then((ref) => {
  //       this.projectRef = this.af.database.object(ref.toString());
  //       this.projectRef.subscribe((s: any) => {
  //         // new project model
  //         this.project = new Project(s);

  //         if (this.project.remapAnnotationsTime() ){
  //           this.updateProject();
  //         };
          
  //       });

  //       // attach project id to user 
  //       this.af.database.object(`/users/${this.userId}/projects/${ref.key}`).set(true);

  //       // upload
  //       this.uploadSource($event, ref.key);
  //     })
  //     .catch(err => console.log(err, 'could not create|upload a new project'));
  // }

  openProject(id: string){
    //this.showOpenDialog = false;
    this.projectRef = this.af.database.object(`/projects/${id}`);
    this.projectRef.subscribe( s => {
      this.project = new Project(s);
      this.setSelectedAnno(this.project.getFirstAnnotationKey());
    });
  }

  updateProject() {
    this.projectRef.update(this.project.data);
  }

  /* upload ------- */
  uploadSource($event) {
    // file-ref to upload
    let sourceFile = $event.target.files[0];
    // upload video
    this.uploadService.getSignedRequest(sourceFile, this.projectId)
      .then((data: Object) => {
        this.uploadService.uploadFile(data['file'], data['response']['signedRequest'])
          .subscribe(
            data => {
              // done uploading to s3
              this.userMessage ='';
              // update state 
              this.http.post('api/state/update', { 
                projectId: this.projectId,
                state: 'uploaded',
                value: true
              }).subscribe((data) => { });
            },
            err => {
              console.log('error: makeFileRequest:', err);
              this.userMessage = 'your video has not been uploaded, contact the admin & grab a coffee';
            }
          );
      });
  }

  updateSource($event) {
    this.uploadSource($event);
  }

  /* annotations -- */
  addAnnotation() {
    let newAnno = this.project.addAnnotation( this.templates['subtitle']);
    this.updateSelectedAnno(newAnno.key, newAnno);
  }

  setSelectedAnno(key) {
    this.selectedAnnotation = this.project.getAnnotation(key);
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
      // update selectedAnno with new template
      this.selectedAnnotation.data = template;
      if (template.duration) {
        // if duration exceeds movieLength
        if (this.selectedAnnotation.start + template.duration > this.project.data.clip.movieLength) {
          this.selectedAnnotation.start = this.project.data.clip.movieLength - template.duration;
        }
        this.selectedAnnotation.end = this.selectedAnnotation.start + template.duration;
      }

      this.updateSelectedAnno(this.selectedAnnotation.key, this.selectedAnnotation);
      this.setSelectedAnno(this.selectedAnnotation.key);
      this.updateProject();
    }
  }
  
  //toggleOpenDialog() { this.showOpenDialog = !this.showOpenDialog; }
  //hideOpenDialog() { this.showOpenDialog = false; }

  // TODO
  onBlur() {
    this.updateProject();
  }

  onKey(input){
    this.selectedAnnotation.data.text[input.key] = input;
    this.setSelectedAnno(this.selectedAnnotation.key);
    // update project => dont push yet to db
    this.project.data['annotations'][`${this.selectedAnnotation.key}`] = this.selectedAnnotation;
  }

  /* render ------- */
  addToRenderQueue() {
    this.http.post('api/render/stitch', { projectId: this.projectId })
      .subscribe((data) => { });
  }

}