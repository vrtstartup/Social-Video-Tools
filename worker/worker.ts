require('ts-node/register');

import * as path from 'path';
import * as fs from 'fs';
import { FireBase } from '../common/services/firebase.service';
import { ffprobe, scaleDown, burnSrt } from '../common/services/encoding.service';
import * as subtitle from '../common/services/subtitle.service';
import { logger } from '../common/config/winston';

// init database 
const fireBase = new FireBase();
const db = fireBase.getDatabase();

const refProcess = db.ref('to-process');
let busyProcessing = false; // busy / idle state

// attach listener to queue
listenQueue();

function listenQueue() {
  refProcess.on('value', (snapshot) => {
    // this runs whenever a new job is created in the queue.
    // logger.verbose('got new queue data'); //#todo feedback
    const jobs = snapshot.val();
    handleQueue(jobs);
  }, (errorObject) => {
    logger.error(`The read failed: ${errorObject.code}`);
  });
}

function handleQueue(jobs) {
   /*
    * This function:
    *   - gets the first job from the queue
    *   - sets job status to InProgress
    *   - gets the related project data
    *   - processes the job
    *   - resolves the job
    */

  // does parsing return data? (e.g. not null etc)
  if (jobs && !busyProcessing) {
    logger.verbose("processing queue...");

    // this isnt possible because handleJob depends on both the results of 'job' and 'project'
    // Promise.All syntax is ugly. 
    // 
    // const job = fireBase.getFirst('to-process', db)
    //   .then(job => setInProgress(job), errorHandler)
    //   .then(job => fireBase.getProjectByJob(job,db), errorHandler)
    //   .then( project => handleJob(job, project), errorHandler)
    //   .then( project => fireBase.resolveJob(job.id), errorHandler)
    //   .then(done, errorHandler);

    const job = fireBase.getFirst('to-process', db)
    
    job.then((job:any) => {
        setInProgress(job); // update job state
        fireBase.getProjectByJob(job, db)
          .then( project => handleJob(job, project), errorHandler)
          .then( project => fireBase.resolveJob(job.id), errorHandler)
          .then(done, errorHandler)
      }, (warning) => logger.warn(warning))
  }
}

function handleJob(job, project) {
  /*
  * check the job operation and process accordingly 
  */

  const operation = job.operation

  return new Promise((resolve, reject) => {
    switch (operation) {
      case 'lowres':
        logger.verbose('processing lowres operation...');
        processLowResJob(project, job).then(resolve, reject);
        break;

      case 'render':
        logger.verbose('processing render operation...');
        processRenderJob(project).then(resolve, reject);
        
        break;
      default:
        logger.warn('processing unknown operation!');
        break;
    }
  });
}

function processLowResJob(project, job) {
    /*
    * This function:
    *   - Executes ffprobe on source file. 
    *   - Updates firebase with returned clip database 
    *   - If possible, scales down the source file to a lower resolution speciefied in the config files
    *   - Updates project status in firebase on success
    *
    *   Note: 
    *   Each operation is performed async. Each component function passes the modified 'project' variable when resolving. 
    */

    return new Promise((resolve, reject) => {
      ffprobe(project)
        .then(updateClip, errorHandler)
        .then(project => scaleDown(project, progressHandler, job), errorHandler)
        .then(updateProjectStatus, errorHandler)
        .then(resolve, errorHandler);
    });
}

function processRenderJob(project) {
    /*
    * This function:
    *   - creates an SRT file containing the project subtitles
    *   - burns the SRT subtitle file onto the project source file
    *
    *   Note: 
    *   Each operation is performed async. Each component function passes the modified 'project' variable when resolving. 
    */

    return new Promise((resolve, reject) => {
      subtitle.makeSrt(project)
        .then(burnSrt, errorHandler)
        .then(resolve, errorHandler);
    });
}

function done() {
  // go to idle state
  logger.verbose("Done, new job possible");
  busyProcessing = false;

  // check wether or not any jobs have been added to queue whilst processing was happening
  refProcess.once('value', (snapshot) => {
    const jobs = snapshot.val();

    handleQueue(jobs);
  }, (errorObject) => {
    logger.error(`The read failed: ${errorObject.code}`);
  });
}

function setInProgress(job) {
  // busyProcessing = true;

  // #todo do I have to wrap this in a promise? 
  return new Promise((resolve, reject) => {
    refProcess.child(job.id)
      .update({ 'status': 'in progress' })
      .then(resolve(job),reject);
  })
}

function progressHandler(message, job) {
  // #todo updating the 'progress' value on the job triggers the listener, creating a feedback loop
  if (typeof message == 'object') {
    // this is an ffmpeg progress message
    refProcess.child(job.id).update({ 'progress': message.progress });
  }
}

function updateClip(project:any) {
  // Update clip field, resolve with full project
  return new Promise((resolve, reject) => {
    let promises = fireBase.setProjectProperties(project.id, { clip: project.clip });

    // data variable contains the data returned by firebase, currently unused
    Promise.all(promises)
      .then(data => resolve(project), reject); 
  });
}

function errorHandler(error) { 
  logger.error('Something went wrong while processing a job', error);
}

function updateProjectStatus(project) {
  // #todo this needs to be a more general function
  // i.e. which status, true/false, ...
  return new Promise((resolve, reject) => {
    fireBase.setProjectProperty(project.id, 'status/downscaled', true)
    .then(fbData => resolve(project), reject);
  }) 
  
}