require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs'); 

export class FireBase {
  public database: any;

  constructor(){
    // this operation is synchronous
    firebase.initializeApp({
      serviceAccount: path.resolve(`./common/firebase/key.json`),
      databaseURL: 'https://socialvideotool.firebaseio.com',
    });

    this.database = firebase.database(); 
  }

  getDatabase() {
    return this.database;
  }

  queue(projectId, firebaseDb?: any) {
    // set a project up for processing in the firebase queue

    // has firebase been initialized? 
    const refQueue = this.database.ref('to-process');

    return refQueue.push({ 
      "projectId": projectId,
      "job": "lowres",
      "status": "open"
    });
  }

  resolveJob(key) {
    // get reference 
    return this.database.ref("to-process").child(key).remove();
  }

  setHighResFileName(projectId, fileName) {
    const refProject = this.database.ref(`projects/${projectId}`);
    // firebaseRef returns a firebase.promise
    return refProject.child("clip/fileName").set(fileName);
  }

  public setLowResFileName(projectId, fileName) {
    const refProject = this.database.ref(`projects/${projectId}`);
    return refProject.child("clip/lowResFileName").set(fileName);
  }

  public setLowResUrl(projectId, url) {
    const refProject = this.database.ref(`projects/${projectId}`);
    return refProject.child("clip/lowResUrl").set(url);
  }

  setProjectBaseDir(projectId, dir) {
    const refProject = this.database.ref(`projects/${projectId}`);
    return refProject.child("baseDir").set(dir);
  }
}
