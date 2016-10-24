import { Component, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import './subtitles.component.scss';
import { UploadService } from '../../../common/services/video.service';
import { Project } from '../../../../models/project.model'

@Component({
    providers: [ UploadService ],
    selector: 'subtitles-component',
    templateUrl: 'subtitles.component.html',
})
export class SubtitlesComponent implements OnInit {

  video: any = { 
      src: "http://static.videogular.com/assets/videos/videogular.mp4",
      type: "video/mp4",
      loop: true,
      movielength: 1.37,  
  };

  subAr: any = [];

  uploadFile: any;
  firebaseToProcess: FirebaseListObservable<any[]>;
  firebaseProjects:  FirebaseListObservable<any[]>;
  firebaseProject: any;
  modelProject: any;

  constructor(
      private http: Http,
      private service: UploadService,
      af: AngularFire
    ) {
      // init AngularFire
      this.firebaseToProcess = af.database.list('/to-process');
      this.firebaseProjects = af.database.list('/projects');

      // subscribe to service observable
      this.service.progress$.subscribe(data => {
        console.log(`progress = ${data}`);
      });
  }

  ngOnInit() {
    this.addSub();
  }

  onChange(event) {
    this.subAr[0] = event;
  }

  newProject() {
    // isntantiate new project
    this.modelProject = new Project();

    // store new project in Firebase
    const projectData = this.modelProject.data(); // serialize project data
    this.firebaseProject = this.firebaseProjects.push(projectData);

    // attach the new firebase key to the local model
    this.modelProject.projectId = this.firebaseProject.key; 
  }

  update() {
    // update firebase reference with local project model
    this.firebaseProject.update( this.modelProject );
  }

  upload($event) {
    // store the new file 
    this.uploadFile = $event.target;

    // Post uploaded video
    this.service.makeFileRequest('http://localhost:8080/upload', this.uploadFile.files[0], this.modelProject.projectId)
      .subscribe((data) => {
        console.log(data);
      });
  }

  queue() {
    // add a project ID to the 'to-process' list
    this.firebaseToProcess.push({ projectId: this.modelProject.projectId });
  }

  addSub() {
    //let emptySub = { start: '0', end: '1.2'};
    //console.log(typeof this.subAr)
    console.log('this.subAr =', this.subAr)

    this.subAr.push( { start: '0', end: '1.2'} );

  }

  makeChange(){
    let subAr = [{start: '0.5', end: '1.2'}];
    this.subAr = subAr;
    //this.subAr = Object.assign({}, [{start: '0.5', end: '1.2'}]);

    //  this.subAr = Object.assign(this.subAr, [{start: '0.8', end: '1.2'}] );
    console.log(this.subAr)
     //
  }
}
