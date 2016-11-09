require('ts-node/register');

import * as path from 'path';
import * as fs from 'fs';
import { FireBase } from '../common/services/firebase.service';
import { ffprobe, scaleDown, burnSrt } from '../common/services/encoding.service';
import * as subtitle from '../common/services/subtitle.service';
import { logger } from '../common/config/winston';

// init database 
const fireBase = new FireBase();

let busyProcessing = false; // busy / idle state

// attach listener to queue
fireBase.listenQueue(handleQueue);

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

    const job = fireBase.getFirst('to-process')
      .then((job:any) => {
        fireBase.setInProgress(job); // update job state
        fireBase.getProjectByJob(job)
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
        .then(project => fireBase.updateProject(project, { 
          clip: project['clip']
        }), errorHandler)
        .then(project => scaleDown(project, progressHandler, job), errorHandler)
        .then(project => fireBase.updateProject(project, { 
          status: {
            downscaled: true
          }}), errorHandler)
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

  fireBase.checkQueue(handleQueue);
}



function progressHandler(message, job) {
  // #todo updating the 'progress' value on the job triggers the listener, creating a feedback loop
  if (typeof message == 'object') { // this is an ffmpeg progress message
    fireBase.updateFfmpegQueue(job, { 'progress': message.progress });
  }
}

function errorHandler(error) { 
  logger.error('Something went wrong while processing a job', error);
}
