require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs');

import { fbConfig } from './firebase.config';

export class FireBase {

  public database: any;

  constructor() {
    // this operation is synchronous
    firebase.initializeApp( fbConfig );

    this.database = firebase.database();
  }

  getDatabase() {
    return this.database;
  }

  queue(projectId, operation, firebaseDb?: any) {
    // set a project up for processing in the firebase queue

    // has firebase been initialized? 
    const refQueue = this.database.ref('to-process');

    return refQueue.push({
      "projectId": projectId,
      "operation": operation,
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

  setReferenceData(firebaseRef, data) {
    // recursively update the properties of the data object on the firebase reference
    // the update operation is destructive when used with nested object values
    let arrPromises = [];

    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        // prop has value 
        const prop = i;
        const val = data[i];
        (typeof val === 'object') ? this.setReferenceData(firebaseRef.child(i), val) : arrPromises.push(firebaseRef.child(i).set(val));
      }
    }
    return arrPromises;
  }
}