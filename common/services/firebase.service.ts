require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs');

import { fbConfig } from '../config/firebase';
import { logger } from '../../common/config/winston';

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
    logger.verbose('successfully processed job...');
    return this.database.ref("to-process").child(key).remove();
  }

  killJob(key, err) {
    // make sure that faulty, error-throwing jobs dont get stuck in an execution loop
    return this.database.ref("to-process").child(key).update({
      status: 'error',
      error: {
        message: err.message ? err.message : 'none',
        type: err.type ? err.type : 'none',
        arguments: err.arguments ? err.arguments : 'none',
        stack: err.stack ? err.stack : 'none'
      }
    });
  }

  getFirst(property:string, firebaseDb?: any) {
    // get the first job from the queue stack
    const refProperty = firebaseDb.ref(property);

    return new Promise((resolve, reject) => {
      refProperty.once('value', (snapshot) => {
        const jobs = snapshot.val(); // list of jobs

        if(jobs !== null && jobs.constructor === Object && Object.keys(jobs).length !== 0) {
          // loop over jobs
          const arrKeys = Object.keys(jobs);
          for (let i=0 ; i < arrKeys.length ; i++ ) {
            const key = arrKeys[i];
            const job = jobs[key];

            if(job.status === 'open'){
              job.id = key;
              resolve(job);
              break;
            }
          }
        }

        reject('No more jobs'); // no more available jobs
      });
    });
  }

  getProjectByJob(job:any, firebaseDb?: any) {
    const projectId = job.projectId;
    const refProject = firebaseDb.ref(`projects/${projectId}`);
    
    // return the project.  
    return refProject.once('value')
      .then( snapshot => {
        // for conveniece sake, append the project ID to the return object
        const project = snapshot.val();
        project.id=snapshot.key;
        return project;
      }, err => logger.error(err) )
  }

  getTemplates(firebaseDb?: any) {
    return new Promise((resolve, reject) => {
      firebaseDb.ref('templates').once('value')
        .then(snapshot => resolve(snapshot.val()), err => logger.error(err));
    });
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