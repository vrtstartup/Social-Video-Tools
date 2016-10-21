require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs'); 

export module FireBase {
  export function database() {
    // this operation is synchronous
    firebase.initializeApp({
      serviceAccount: path.resolve(`./common/firebase/key.json`),
      databaseURL: 'https://socialvideotool.firebaseio.com',
    });

    return firebase.database(); 
  }

  export function queue(projectId, firebaseDb?: any) {
    // set a project up for processing in the firebase queue

    // has firebase been initialized? 
    const db = (typeof firebaseDb === 'undefined') ? database() : firebaseDb;
    const refQueue = db.ref('to-process');

    return refQueue.push({ 
      "projectId": projectId,
      "job": "lowres",
      "status": "open"
    });
  }

  export function resolveJob(key, firebaseDb?: any) {
    // has firebase been initialized? 
    const db = (typeof firebaseDb === 'undefined') ? database() : firebaseDb;

    // get reference 
    return db.ref("to-process").child(key).remove();
  }

  export function setHighResFileName(projectId, fileName, firebaseDb?: any) {
    const db = (typeof firebaseDb === 'undefined') ? database() : firebaseDb;
    const refProject = db.ref(`projects/${projectId}`);

    // firebaseRef returns a firebase.promise
    return refProject.child("clip/fileName").set(fileName);
  }

  export function setLowResFileName(projectId, fileName, firebaseDb?: any) {
    const db = (typeof firebaseDb === 'undefined') ? database() : firebaseDb;
    const refProject = db.ref(`projects/${projectId}`);

    return refProject.child("clip/lowResUrl").set(fileName);
  }

  export function setProjectBaseDir(projectId, dir, firebaseDb?: any) {
    const db = (typeof firebaseDb === 'undefined') ? database() : firebaseDb;
    const refProject = db.ref(`projects/${projectId}`);

    return refProject.child("baseDir").set(dir);
  }
}
