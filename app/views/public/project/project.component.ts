import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/take';
import { UploadService } from '../../../common/services/upload.service';
import { Project } from '../../../common/models/project.model';
import { UserService } from '../../../common/services/user.service';

// TODO remove | only for test purposes
import testTemplate from '../../../common/models/testTemplate.model';

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
  templateSelectorFlag: any;

  af: AngularFire;
  ffmpegQueueRef: FirebaseListObservable<any[]>;
  templaterQueueRef: FirebaseListObservable<any[]>;
  projectRefOnce: Observable<any[]>;
  projectRef: FirebaseObjectObservable<any[]>;
  project: any;
  selectedAnnotationKey: any = '';
  selectedAnnotation: any;
  templatesRef: FirebaseObjectObservable<any[]>;
  stylesRef: FirebaseObjectObservable<any[]>;
  templates: any[];
  selectedTemplate: any;
  projectId: string;
  // subscribtions
  userSub: any;
  templatesSub: any;
  uploadServiceSub: any;

  constructor(
    af: AngularFire,
    private zone: NgZone,
    private http: Http,
    private router: Router,
    private route: ActivatedRoute,
    private uploadService: UploadService,
    private userService: UserService) {

    this.af = af;
    this.projectId =  this.route.snapshot.params['id'];
    // general Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.templatesRef = af.database.object('/templates');
    this.projectRef = this.af.database.object(`/projects/${this.projectId}`);
  }

  ngOnInit() {
    // TODO remove | only for test purposes | move to server
    this.templatesRef.set(testTemplate);

    this.templatesSub = this.templatesRef.subscribe(
      data => this.templates = data
    );

    this.userSub = this.userService.user$.subscribe(
      data => this.userId = data.userID ,
      err => console.log('authserviceErr', err)
    );
    
    this.uploadServiceSub = this.uploadService.progress$.subscribe(data => {
        this.zone.run(() => this.uploadProgress = data); // force to trigger change
      }, err => console.log(err));

    // only firstTime when project is loaded set 
    let onlyOnce = true;
    // project subscribtion
    this.projectRef.subscribe( s => { 
      this.project = new Project(s);
      if(onlyOnce) { this.setSelectedAnno(this.project.getSortedAnnoKey('last')), onlyOnce = false;};
    });

  }

  ngOnDestroy(){
    this.userSub.unsubscribe();;
    this.templatesSub.unsubscribe();
    this.uploadServiceSub.unsubscribe();
  }

  updateProject() {
    if(this.project && this.project.data){
      this.projectRef.update(this.project.data);
    }
  }

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

  addAnnotation(annotationName: string) {
    let newAnno = this.project.addAnnotation( this.templates[annotationName]);
    this.updateProject();
    this.setSelectedAnno(newAnno.key);
  }

  setSelectedAnno(key) {
    this.toggleTemplateSelector();
    this.selectedAnnotationKey = key;
    //console.log('setSelectedAnno()', this.selectedAnnotationKey);
    //this.selectedAnnotation = this.project.getAnnotation(key);
  }

  updateAnnotation(key, obj) {
    this.project.updateAnnotation(key, obj);
    this.updateProject();
  }

  deleteAnnotation(key) {
    // when you delete the selected
    if (this.selectedAnnotationKey === key) {
      this.selectedAnnotationKey = false;
    }
    delete this.project.data['annotations'][`${key}`];
    this.updateProject();
  }

  updateTemplate(template) {
    // only update if you select a different template for the annotation
    if (template.key != this.selectedAnnotationKey) {
      // update selectedAnno with new template
      this.project.data.annotations[this.selectedAnnotationKey].data = template;
      this.toggleTemplateSelector();
      
      // if (template.duration) {
      //   // if duration exceeds movieLength
      //   if (this.selectedAnnotation.start + template.duration > this.project.data.clip.movieLength) {
      //     this.selectedAnnotation.start = this.project.data.clip.movieLength - template.duration;
      //   }
      //   this.selectedAnnotation.end = this.selectedAnnotation.start + template.duration;
      // }

      //this.updateAnnotation(this.selectedAnnotationKey, this.selectedAnnotation);
      //this.setSelectedAnno(this.selectedAnnotation.key);
      this.updateProject();
    }
  }

  // TODO
  onBlur(input) {
    this.project.data.annotations[this.selectedAnnotationKey].data.text[input.key] = input;
    //this.updateAnnotation(this.selectedAnnotationKey, this.selectedAnnotation);
    //this.setSelectedAnno(this.selectedAnnotation.key);
    this.updateProject();
  }

  onKeyUp(input){
  //   this.selectedAnnotation.data.text[input.key] = input;
  //   this.setSelectedAnno(this.selectedAnnotation.key);
  //   // update project => dont push yet to db
      this.project.data.annotations[this.selectedAnnotationKey].data.text[input.key] = input;
      //console.log(this.project.data.annotations[this.selectedAnnotationKey].data.text[input.key] )
      //this.project.data['annotations'][`${this.selectedAnnotation.key}`] = this.selectedAnnotation;

      this.zone.run(() => {console.log(this.project.data.annotations[this.selectedAnnotationKey].data.text) })
      setTimeout(()=>console.log('run'));
  }

  addToRenderQueue() {
    this.http.post('api/render/stitch', { projectId: this.projectId })
      .subscribe((data) => { });
  }

  toggleTemplateSelector(key?){
    if(key === 'undefined' || this.templateSelectorFlag === key) { 
      return this.templateSelectorFlag = ''; 
    }
    this.templateSelectorFlag = key;
  }

}