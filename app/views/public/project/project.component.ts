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
  defaultAnnotationTemplate: string;

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
  //templastes
  templates: any;
  logoTemplates: any;
  outroTemplates: any;
  selectedTemplate: any;
  defaultOutroTemplate: any;
  selectedOutroKey: any;
  projectId: string;
  // subscribtions
  userSub: any;
  projectSub: any;
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
    this.defaultAnnotationTemplate = 'defaultSubtitle';
    this.defaultOutroTemplate = 'bumper'; // default selected
    // general Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.templatesRef = af.database.object('/templates');
    this.projectRef = this.af.database.object(`/projects/${this.projectId}`);
  }

  ngOnInit() {
    // TODO remove | only for test purposes | move to server
    this.templatesRef.set(testTemplate);

    this.templatesSub = this.templatesRef
      .subscribe((data) => { 
          // remove Firebase properties
          delete data['$key'];
          delete data['$exists'];
          // split data in outro | logo | annotation templateLists
          const newAnnoList:any = {};
          const newLogoTempList:any = {};
          const newOutroTempList:any = {};

          for (let key in data){
            if( data[key]['type'] === 'logo') newLogoTempList[key] = data[key] 
            else if( data[key]['type'] === 'outro' ) newOutroTempList[key] = data[key]
            else if( data[key]['type'] !== 'logo' && data[key]['type'] !== 'outro') newAnnoList[key] = data[key];
          }
          this.templates = newAnnoList;
          this.outroTemplates = newOutroTempList;
          this.logoTemplates = newLogoTempList;
        }
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
    this.projectSub = this.projectRef.subscribe( data => { 
      this.project = new Project(data);
      
      if(this.project.data.status && this.project.data.status.downscaled && !this.project.getOutroKey() ) {
        // add default outro if no annotations yet
        this.project.addOutro( this.outroTemplates[this.defaultOutroTemplate]);
        this.selectedOutroKey = this.project.getOutroKey();
        this.updateProject();
      }

      if(onlyOnce) { 
        // else get annotation with type outro
        this.selectedOutroKey = this.project.getOutroKey();
        this.setSelectedAnno(this.project.getSortedAnnoKey('last')), onlyOnce = false;
      };

    });
  }

  ngOnDestroy(){
    this.userSub.unsubscribe();
    this.projectSub.unsubscribe();
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

  addAnnotation() {
    let newAnno = this.project.addAnnotation( this.templates[this.defaultAnnotationTemplate]);
    this.updateProject();
    this.setSelectedAnno(newAnno.key);
  }

  updateOutro(event) {
    this.project.updateOutro(this.selectedOutroKey, this.outroTemplates[event.target.value])
    this.updateProject();
  }

  setSelectedAnno(key) {
    this.toggleTemplateSelector();
    this.selectedAnnotationKey = key;
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
    this.updateProject();
  }

  onKeyUp(input){
  // //   this.selectedAnnotation.data.text[input.key] = input;
  // //   this.setSelectedAnno(this.selectedAnnotation.key);
  // //   // update project => dont push yet to db
  //     this.project.data.annotations[this.selectedAnnotationKey].data.text[input.key] = input;
  //     //console.log(this.project.data.annotations[this.selectedAnnotationKey].data.text[input.key] )
  //     //this.project.data['annotations'][`${this.selectedAnnotation.key}`] = this.selectedAnnotation;

  //     this.zone.run(() => {console.log(this.project.data.annotations[this.selectedAnnotationKey].data.text) })
  //     setTimeout(()=>console.log('run'));
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