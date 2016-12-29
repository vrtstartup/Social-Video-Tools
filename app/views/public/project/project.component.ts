import { Component, NgZone, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/take';
import { UploadService } from '../../../common/services/upload.service';
import { Project } from '../../../common/models/project.model';
import { UserService } from '../../../common/services/user.service';
import { BrandService} from '../../../common/services/brands.service';
import { Brand } from '../../../common/models/brand.model';
import { User } from '../../../common/models/user.model';

import { HotkeysService } from '../../../../node_modules/angular2-hotkeys/src/services/hotkeys.service';
import { Hotkey } from '../../../../node_modules/angular2-hotkeys/src/models/hotkey.model';

// TODO remove | only for test purposes
import testTemplate from '../../../common/models/testTemplate.model';

@Component({
  providers: [UploadService, BrandService, HotkeysService],
  selector: 'project-component',
  templateUrl: './project.component.html',
  host: {
    '(document:click)': 'onClick($event)',
  },
})

export class ProjectComponent implements OnInit, OnDestroy {

  user: User;
  userMessage: string = '';
  uploadProgress: any;
  downScaleProgress: any;
  templateSelectorFlag: any;
  defaultAnnotationTemplate: string;
  showBrandList: boolean;
  showLogoList: boolean;
  showOutroList: boolean;
  notification: any;

  af: AngularFire;
  ffmpegQueueRef: FirebaseListObservable<any[]>;
  templaterQueueRef: FirebaseListObservable<any[]>;
  projectRefOnce: Observable<any[]>;
  projectRef: FirebaseObjectObservable<any[]>;
  userRef: FirebaseObjectObservable<any[]>;
  project: any;
  selectedAnnotationKey: any;
  selectedAnnotation: any;
  templatesRef: FirebaseObjectObservable<any[]>;
  stylesRef: FirebaseObjectObservable<any[]>;
  possibleBrands: Array<Brand>;

  //templates
  templates: any;
  logoTemplates: any;
  outroTemplates: any;
  selectedTemplate: any;
  defaultAnnotationTemplateName: any;
  outroKey: any;
  logoKey: any;
  defaultOutroKey: any;
  defaultLogoKey: any;
  projectId: string;
  templateFilter: Object;

  // subscribtions
  userSub: any;
  brandSub: any;
  projectSub: any;
  templatesSub: any;
  uploadServiceSub: any;
  pausePlayTrigger: any;
  previewTrigger: any;

  // application state
  uploading: boolean;
  seek: number;

  constructor(
    af: AngularFire,
    private zone: NgZone,
    private http: Http,
    private router: Router,
    private route: ActivatedRoute,
    private uploadService: UploadService,
    private userService: UserService,
    private BrandService: BrandService,
    private _hotkeysService: HotkeysService,
    private _el: ElementRef) {
    this.seek = 0;
    this.af = af;
    this.projectId =  this.route.snapshot.params['id'];
    this.selectedAnnotationKey = '';
    this.defaultOutroKey = '';
    this.defaultLogoKey = '';
    this.defaultAnnotationTemplateName = false;
    this.notification = false;

    // application state 
    this.uploading = false;

    // general Firebase-references
    this.ffmpegQueueRef = af.database.list('/ffmpeg-queue');
    this.templaterQueueRef = af.database.list('/templater-queue');
    this.templatesRef = af.database.object('/templates');
    this.projectRef = this.af.database.object(`/projects/${this.projectId}`);
    
    this._hotkeysService.add(new Hotkey('ctrl+u', (event: KeyboardEvent): boolean => {
      this.addAnnotation();
      return false; // Prevent bubbling
    }));
    this._hotkeysService.add(new Hotkey('space', (event: KeyboardEvent): boolean => {
      this.pausePlayTrigger = Object.assign({}, this.pausePlayTrigger);
      return false; // Prevent bubbling
    }));
  }

  ngOnInit() {
    // TODO remove | only for test purposes | admin
    this.templatesRef.set(testTemplate);

    this.loadUser();
    this.loadBrands();

    this.uploadServiceSub = this.uploadService.progress$.subscribe(data => {
        this.zone.run(() => this.uploadProgress = data); // trigger change detecton
      }, console.log);
  }

  ngOnDestroy(){
    this.userSub.unsubscribe();
    this.projectSub.unsubscribe();
    this.templatesSub.unsubscribe();
    this.uploadServiceSub.unsubscribe();
  }

  loadTemplates(){
    this.templatesSub = this.templatesRef
      .subscribe((templates) => { 
          // remove Firebase properties
          delete templates['$key'];
          delete templates['$exists'];
          // split templates in outro | logo | annotation templateLists
          const newAnnoList:any = {};
          const newLogoTempList:any = {};
          const newOutroTempList:any = {};

          for (let key in templates){
            const template = templates[key];
            if( template['type'] === 'logo') newLogoTempList[key] = template 
            else if( template['type'] === 'outro' ) newOutroTempList[key] = template
            else if( template['type'] !== 'logo' && template['type'] !== 'outro') newAnnoList[key] = template;
          }
          this.templates = newAnnoList;
          this.outroTemplates = newOutroTempList;
          this.logoTemplates = newLogoTempList;

          // #todo when selecting a different brand and opening another project this is faulty
          // get and store default templates from brand
          const arrOutroKeys = Object.keys(this.outroTemplates);
          this.defaultOutroKey = arrOutroKeys[0];

          const arrLogoKeys = Object.keys(this.logoTemplates);
          this.defaultLogoKey = arrLogoKeys[0];

          const arrTemplateKeys = Object.keys(this.templates);
          this.defaultAnnotationTemplateName = this.templates[arrTemplateKeys[0]]['name'];
        }
      );
  }

  loadUser(){
    this.userSub = this.userService.user$.subscribe(
      data =>{ 
        this.user = data;
        this.userRef = this.af.database.object(`/users/${this.user['$key']}`);
      
        // loadproject() depends on user data
        this.loadProject();
    },
      err => console.log('authserviceErr', err)
    );
  }

  loadBrands(){ this.brandSub = this.BrandService.brands$.subscribe(this.brandsHandler.bind(this), console.log) }

  loadProject(){
    this.projectSub = this.projectRef.subscribe( data => { 
      // store updated project data
      this.project = new Project(data);

      // set tempalte filter to brand
      this.templateFilter = { brand:this.project.data.brand };

      if(this.selectedAnnotationKey === '') this.setSelectedAnno(this.project.getSortedAnnoKey('last'));

      // set default logo and bumper 
      if( !this.project.data.hasOwnProperty('defaultsSet') && this.project.data.clip && this.project.data.clip['movieLength']) {
        if(this.defaultLogoKey) this.updateLogo(this.defaultLogoKey);
        if(this.defaultOutroKey) this.updateOutro(this.defaultOutroKey);
        this.project.data.defaultsSet = true;
        this.updateProject();
      }else{
        // logoKey and outoKey do need to be set 
        this.logoKey = this.project.getAnnoKeyOfType('logo');
        this.outroKey = this.project.getAnnoKeyOfType('outro');
      }

      this.loadTemplates(); // depends on project data
    });
  }

  updateProject() {
    if (this.project && this.project.data) {
      this.projectRef.update(this.project.data);
    }
  }

  updateUser(){
    //#todo delete statements can be avoided by implementing User() class objects
    if(this.userRef && this.user){
      const user = this.user;
      delete user['$exists'];
      delete user['$key'];
      this.userRef.update(user);
    }
  }

  uploadSource($event) {
    this.uploading = true;
    let sourceFile = $event.target.files[0]; // file-ref to upload
    // upload video
    this.uploadService.getSignedRequest(sourceFile, this.projectId)
      .then((data: Object) => {
        this.uploadService.uploadFile(data['file'], data['response']['signedRequest'])
          .subscribe(
          data => {
            // done uploading to s3
            this.userMessage = '';
            // update state 
            this.http.post('api/state/update', {
              projectId: this.projectId,
              state: 'uploaded',
              value: true
            }).subscribe((data) => this.uploading = false);
          },
          err => {
            console.log('error: makeFileRequest:', err);
            this.userMessage = 'your video has not been uploaded, contact the admin & grab a coffee';
          }
          );
      });
  }

  addAnnotation() {
    let newAnno = this.project.addAnnotation( this.templates[this.defaultAnnotationTemplateName]);

    if(newAnno) {
      this.updateProject();
      this.setSelectedAnno(newAnno.key);
    }else{
      this.errorHandler({
        title: 'Warning',
        message: `Could not add annotation because default template has invalid value "${this.defaultAnnotationTemplateName}"`
      });
    }
  }

  updateAnnotation(key, event) {
    this.seek = event.start; // set seek position to annotation start time
    this.project.updateAnnotation(key, event)
    this.updateProject();
  }

  updateOutro(outroKey) {
    this.outroKey = this.project.setOutro(this.outroTemplates[outroKey]);
    this.updateProject();
  }

  updateLogo(logoKey) {
    this.logoKey = this.project.setLogo(this.logoTemplates[logoKey])
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

  deleteOutro(){
      const outroKey = this.project.getAnnoKeyOfType('outro');
      if(outroKey) this.deleteAnnotation(outroKey);
  }

  deleteLogo(){
      const outroKey = this.project.getAnnoKeyOfType('logo');
      if(outroKey) this.deleteAnnotation(outroKey);
  }
  isProcessing(): boolean {
      // returns a boolean indication wether any form of processing is being done on the project  
      // and wether or not, as a result, a progress dialog should be shwon to the user. 
      // types of processing include :
      //      * uploading to s3
      //      * scaling sown source video
      //      * stitching assets to render final video 

      const uploadingSource = this.uploading;
      const rendering = this.project.isRendering();

      const hasStatus = this.project.data.hasOwnProperty('status');

      const queued = hasStatus ? this.project.data.status.queued : false;
      const uploadingRemote = hasStatus ? this.project.data.status.storing : false;
      const scaling = hasStatus ? this.project.data.status.downScaleProgress > 0 && this.project.data.status.downScaleProgress < 100 : false;

      return (queued || rendering || uploadingSource || uploadingRemote || scaling);
  }

  updateTemplate(template) {
    // only update if you select a different template for the annotation
    if (template.key != this.selectedAnnotationKey) {
      // we want to preserve any user input and map it to the new template. 
      // if both the old the old and the new template have one input field, remap users content
      const oldTemplate = this.project.data.annotations[this.selectedAnnotationKey].data;
      const newTemplate = template; 

      const arrKeysOld = Object.keys(oldTemplate['text']);
      const arrKeysNew = Object.keys(newTemplate['text']);

      if(arrKeysNew.length === 1 && arrKeysOld.length === arrKeysNew.length){
        newTemplate['text'][arrKeysNew[0]]['text'] = oldTemplate['text'][arrKeysOld[0]]['text'];
    }
      // update selectedAnno with new template
      this.project.data.annotations[this.selectedAnnotationKey].data = newTemplate;
      this.toggleTemplateSelector();

      this.updateProject();
    }
  }

  brandsHandler(brands: Array<Brand>){ this.possibleBrands = brands }

  changeBrand(brand){
    this.project.data.brand = brand;
    this.user['defaultBrand'] = brand;

    this.showBrandList = false;
    
    this.updateProject();
    this.updateUser(); 
  }

  // TODO
  onBlur(input) {
    this.project.data.annotations[this.selectedAnnotationKey].data.text[input.key] = input;
    this.updateProject();
  }

  onKeyUp(input) {
    this.project.data.annotations[this.selectedAnnotationKey].data.text[input.key] = input;
    this.project.data.annotations = Object.assign({}, this.project.data.annotations);
  }

  preview() {
    this.selectedAnnotationKey = '';
    this.previewTrigger = Object.assign({}, this.previewTrigger);
  }

  addToRenderQueue() {
    this.http.post('api/render/stitch', { projectId: this.projectId })
      .subscribe((data) => {});
  }

  toggleTemplateSelector(key?) {
    if (key === 'undefined' || this.templateSelectorFlag === key) {
      return this.templateSelectorFlag = '';
    }
    this.templateSelectorFlag = key;
  }

  downloadFile(projectKey: string) { location.href = `api/file/download/${projectKey}` }

  onClick(event) {
    if( this.project && this.project['data']['annotations']) {
  
      const elBrandDropdown = this._el.nativeElement.querySelector('#s-brand-dropdown');
      const elOutroDropdown = this._el.nativeElement.querySelector('#s-outro-dropdown');
      const elLogoDropdown = this._el.nativeElement.querySelector('#s-logo-dropdown');

      if (elBrandDropdown && !elBrandDropdown.contains(event.target)) {
        this.showBrandList = false;
      }

      if (elOutroDropdown && !elOutroDropdown.contains(event.target)) {
        this.showOutroList = false;
      }

      if (elLogoDropdown && !elLogoDropdown.contains(event.target)) {
        this.showLogoList = false;
      }
    }
  }

  errorHandler(err){
    this.notification = err;
    console.log(err);
  }

}