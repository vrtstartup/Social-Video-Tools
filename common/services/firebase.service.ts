require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs');

import { fbConfig } from '../config/firebase';
import { logger } from '../../common/config/winston';

export class FireBase {

  public database: any;
  public refFfmpegQueue: any;

  constructor() {
    // this operation is synchronous
    firebase.initializeApp( fbConfig );

    this.database = firebase.database();
    this.refFfmpegQueue = this.database.ref('to-process');
  }

  queue(projectId, operation, firebaseDb?: any) {
    // set a project up for processing in the firebase queue

    // has firebase been initialized? 
    const refFfmpegQueue = this.database.ref(`to-process/${projectId}`);

    return refFfmpegQueue.update({
      "operation": operation,
      "status": "open"
    });
  }

  resolveJob(queue:string, key: string) {
    // get reference 
    logger.verbose('successfully processed job...');
    return this.database.ref(`${queue}`).child(key).remove();
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

  titlesReady(project:any) {
    // check if all assets have been rendered
    // resolve job if they have 
    return new Promise((resolve, reject) => {
      let titles = project.titles;
      let titlesDone = true;

      for(let key in titles) {
        if(titles.hasOwnProperty(key)) {
          titlesDone = titlesDone && (titles[key]['render-status'] === 'done');
        }
      }

      if(titlesDone){
        this.resolveJob('templater-queue', project.id)
          .then(resolve);
      } else{
        resolve();
      }
    });

  }

  getFirst(property:string) {
    // #todo implement logic for picking the proper job
    // get the first job from the queue stack
    const refProperty = this.database.ref(property);

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

  getProjectByJob(job:any) {
    const refProject = this.database.ref(`projects/${job.id}`);
    
    // return the project.  
    // #todo return value, wth?
    return refProject.once('value')
      .then( snapshot => {
        // for conveniece sake, append the project ID to the return object
        const project = snapshot.val();
        project.id=snapshot.key;
        return project;
      }, err => logger.error(err) )
  }

  getProjectById(id:string) {
    const refProject = this.database.ref(`projects/${id}`);

    return new Promise((resolve, reject) => {
      refProject.once('value')
      .then( snapshot => {
        const project = snapshot.val();
        project.id=snapshot.key;
        resolve(project);
      }, err => reject(err))
    });
  }

  getTemplates() {
    return new Promise((resolve, reject) => {
      this.database.ref('templates').once('value')
        .then(snapshot => resolve(snapshot.val()), err => logger.error(err));
    });
  }

  setInProgress(job) {
    // busyProcessing = true;

    // #todo do I have to wrap this in a promise? 
    return new Promise((resolve, reject) => {
      this.refFfmpegQueue.child(job.id)
        .update({ 'status': 'in progress' })
        .then(resolve(job),reject);
    })
  }

  listenQueue(handler) {
    this.refFfmpegQueue.on('value', (snapshot) => {
      // this runs whenever a new job is created in the queue.
      // logger.verbose('got new queue data'); //#todo feedback
      const jobs = snapshot.val();
      handler(jobs);
    }, (errorObject) => {
      logger.error(`The read failed: ${errorObject.code}`);
    });
  }

  checkQueue(handler) {
    // check wether or not any jobs have been added to queue whilst processing was happening
    this.refFfmpegQueue.once('value', (snapshot) => {
      const jobs = snapshot.val();

      handler(jobs);
    }, (errorObject) => {
      logger.error(`The read failed: ${errorObject.code}`);
    });
  }

  updateProject(project:any, value: Object) {
    // Update the firebase entry property for a given project
    return new Promise((resolve, reject) => {
      const ref = this.database.ref(`projects/${project.id}`);
      ref.update(value)
        .then(resolve(project), reject);
    });
  }

  updateFfmpegQueue(job:any, value: Object) {
    // Update the firebase entry property for a given project
    return new Promise((resolve, reject) => {
      const ref = this.database.ref(`to-process/${job.id}`);
      ref.update(value)
        .then(resolve(job), reject);
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