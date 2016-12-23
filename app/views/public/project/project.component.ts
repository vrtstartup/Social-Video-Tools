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
  selectedOutroName: any;
  defaultLogoTemplate: any;
  defaultAnnotationTemplateName: any;
  selectedOutroKey: any;
  selectedLogoKey: any;
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

    this.af = af;
    this.projectId =  this.route.snapshot.params['id'];
    this.selectedAnnotationKey = '';
    this.selectedOutroKey = '';
    this.defaultAnnotationTemplateName = false;
    this.selectedOutroName = false;
    this.defaultLogoTemplate = 'logo'; // #todo set by default
    this.notification = false;

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
        this.zone.run(() => this.uploadProgress = data); // force to trigger change
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
          const arrOutroKeys = Object.keys(this.outroTemplates);
          const outroKey = arrOutroKeys[0];
          // this.selectedOutroName = this.outroTemplates[outroKey]['name']; // what if no outros are set to this brand? 

          const arrTemplateKeys = Object.keys(this.templates);
          // this.defaultAnnotationTemplateName = this.templates[arrTemplateKeys[0]]['name']; // what if no templates are set to this brand? 

          // if(this.project.data.status && this.project.data.status.downscaled && !this.project.getOutroKey() ) {
          //   // this.setProjectOutro();
          // }

          this.initOutroAndLogo();
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
      this.project = new Project(data);
      this.templateFilter = { brand:this.project.data.brand };
      if(this.selectedAnnotationKey === '' && this.selectedOutroKey === '') { 
        this.setSelectedTemplates();
      };
      this.loadTemplates(); // depends on project data
    });
  }

  setProjectOutro(){
    // add default outro if no annotations yet
      if(this.selectedOutroName){
        this.project.addOutro( this.outroTemplates[this.selectedOutroName]);
        this.selectedOutroKey = this.project.getAnnoKeyOfType('outro');
        this.updateProject();
      }
  }

  setSelectedTemplates() {
    this.selectedOutroKey = this.project.getAnnoKeyOfType('outro');
    this.setSelectedAnno(this.project.getSortedAnnoKey('last'));
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
    // file-ref to upload
    let sourceFile = $event.target.files[0];
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
            }).subscribe((data) => { });
          },
          err => {
            console.log('error: makeFileRequest:', err);
            this.userMessage = 'your video has not been uploaded, contact the admin & grab a coffee';
          }
          );
      });
  }

  initOutroAndLogo() {
    if (!this.project.getAnnoKeyOfType('outro') && this.selectedOutroName) {
      const newAnno = this.project.addOutro(this.outroTemplates[this.selectedOutroName]);
      if(newAnno) { this.selectedOutroKey = newAnno.key, this.updateProject()}
    } else {
      this.selectedOutroKey = this.project.getAnnoKeyOfType('outro');
    }
    if (!this.project.getAnnoKeyOfType('logo')) {
      const newAnno = this.project.addLogo(this.logoTemplates[this.defaultLogoTemplate]);
      if (newAnno) { this.selectedLogoKey = newAnno.key, this.updateProject() }
    } else {
      this.selectedLogoKey = this.project.getAnnoKeyOfType('logo');
    }
  }

  addAnnotation() {
    let newAnno = this.project.addAnnotation( this.templates[this.defaultAnnotationTemplateName]);

    if(newAnno) {
      this.updateProject();
      this.setSelectedAnno(newAnno.key);
    }else{
      this.errorHandler({
        title: 'Warning',
        message: 'Could not add annotation because no templates are available'
      });
    }
  }

  updateAnnotation(key, event) {
    this.project.updateAnnotation(key, event)
    this.updateProject();
  }

  updateOutro(outroKey) {
    this.project.updateOutro(this.selectedOutroKey, this.outroTemplates[outroKey])
    this.updateProject();
  }

  updateLogo(logoData) {
    this.project.updateLogo(this.selectedLogoKey, this.logoTemplates[logoData])
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
      .subscribe((data) => { });
  }

  toggleTemplateSelector(key?) {
    if (key === 'undefined' || this.templateSelectorFlag === key) {
      return this.templateSelectorFlag = '';
    }
    this.templateSelectorFlag = key;
  }

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
  }

}