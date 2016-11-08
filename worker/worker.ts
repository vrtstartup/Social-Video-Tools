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

// #todo: the way these variables are scoped isn't that great
let jobKey;
let projectId;

// attach listener to queue
listenQueue();

function listenQueue() {
  refProcess.on('value', (snapshot) => {
    // this runs whenever a new job is created in the queue.
    logger.verbose('got new queue data');
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
    busyProcessing = true;

    fireBase.getFirst('to-process', db)
      .then((job: any) => {
        // Process job
        // update the queue item status
        jobKey = job.key;
        projectId = job.projectId;

        setInProgress(jobKey); // update job state

        fireBase.getProject(job.projectId, db)
          .then( project => handleJob(job.operation, project), errorHandler)
          .then(fireBase.resolveJob(jobKey), errorHandler)
          .then(done, errorHandler)
      }, (warning) => logger.warn(warning))
  }
}

function handleJob(operation, project) {
  /*
  * check the job operation and process accordingly 
  */
  return new Promise((resolve, reject) => {
    switch (operation) {
      case 'lowres':
        logger.verbose('processing lowres operation...');
        processLowResJob(project).then(resolve, reject);
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

function processLowResJob(project) {
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
        .then(project => scaleDown(project, progressHandler), errorHandler)
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

function setInProgress(jobKey) {
  refProcess.child(jobKey).update({ 'status': 'in progress' });
}

function progressHandler(message) {
  // #todo updating the 'progress' value on the job triggers the listener, creating a feedback loop
  if (typeof message == 'object' && message.hasOwnProperty("percent")) {
    // this is an ffmpeg progress message
    refProcess.child(jobKey).update({ 'progress': message.percent });
  }
}

function updateClip(project:any) {
  // Update clip field, resolve with full project
  return new Promise((resolve, reject) => {
    let promises = fireBase.setProjectProperties(projectId, { clip: project.clip });

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
    fireBase.setProjectProperty(projectId, 'status/downscaled', true)
    .then(resolve(project), reject);
  }) 
  
}