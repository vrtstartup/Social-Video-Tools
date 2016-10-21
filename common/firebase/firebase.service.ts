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

  setProjectProperty(projectId, property, value) {
    const refProject = this.database.ref(`projects/${projectId}`);
    return refProject.child(property).set(value);
  }

  setProjectProperties(projectId, properties) {
    const refProject = this.database.ref(`projects/${projectId}`);
    return this.setReferenceData(refProject, properties);
  }

  setReferenceData(firebaseRef, data){
    // recursively update the properties of the data object on the firebase reference
    // the update operation is destructive when used with nested object values
    for(var i in data) {
        if(data.hasOwnProperty(i)){
          // prop has value 
          const prop = i;
          const val = data[i];
          (typeof val === 'object') ?  this.setReferenceData(firebaseRef.child(i), val) : firebaseRef.child(i).set(val);
        }
    }
    return null;
  }
}
