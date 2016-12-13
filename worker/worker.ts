require('ts-node/register');

import * as path from 'path';
import * as fs from 'fs';
import { db } from '../common/services/firebase.service';
import { Jobs } from '../common/services/jobs.service';
import { Projects } from '../common/services/projects.service';
import { Project } from '../common/classes/project';
import { State } from '../common/services/state.service';
import * as storage from '../common/services/storage.service';
import { ffprobe, scaleDown, stitch } from '../common/services/encoding.service';
import { Subtitle } from '../common/services/subtitle.service';
import { logger } from '../common/config/winston';
import { config } from '../common/config';

const projectService = new Projects();
const stateService = new State();
const jobService = new Jobs();
const subtitle = new Subtitle();

let busyProcessingLowres = false;
let busyProcessingStitch = false;

// create temp dat dir if it doesnt exist
const dataDir = config.filesystem.workingDirectory;

if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

// attach listener to queue
jobService.listenQueue(handleQueue);

function handleQueue(jobs) {
   /*
    * This function:
    *   - gets the first job from the queue
    *   - sets job status to in progress
    *   - gets the related project data
    *   - processes the job
    *   - resolves the job
    */

  // does parsing return data? (e.g. not null etc)
  if (jobs) {
    // logger.verbose("processing queue...");ls app

    const jobs = [
      jobService.getFirst('ffmpeg-queue', 'render'),
      jobService.getFirst('ffmpeg-queue', 'lowres'),
    ];

    Promise.all(jobs).then( data => {
      const stitchingJob = data[0];
      const lowresJob = data[1];

      if(stitchingJob && !busyProcessingStitch) {
        busyProcessingStitch = true;
        const job = stitchingJob;

        jobService.setInProgress(job); // update job state
          projectService.getProjectByJob(job)
            .then( project => handleJob(job, project), errorHandler)
            .then( project => jobService.resolve('ffmpeg-queue', job['id']), errorHandler)
            .then( fbData => done(job), errorHandler)
      }

      if(lowresJob && !busyProcessingLowres) {
        busyProcessingLowres = true;
        const job = lowresJob;

        jobService.setInProgress(job); // update job state
          projectService.getProjectByJob(job)
            .then( project => handleJob(job, project), errorHandler)
            .then( project => jobService.resolve('ffmpeg-queue', job['id']), errorHandler)
            .then( fbData => done(job), errorHandler)
      }
    }, logger.info('no job found'))
    .catch(errorHandler);
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
        processRenderJob(project, job)
          .then((project:Project) => stateService.updateState(project, 'render', true))
          .then(resolve, reject);
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
        .then(project => projectService.updateProject(project, { 
          clip: project['data']['clip']
        }))
        // scaledown
        .then((project:Project) => stateService.updateState(project, 'downscaled', false))
        .then(project => scaleDown(project, progressHandler, job))
        // store
        .then((project:Project) => stateService.updateState(project, 'storingDownScaled', true))
        .then(project => storage.uploadFile(project, 'lowres'))
        .then((project:Project) => stateService.updateState(project, 'storingDownScaled', false))
        // set final status
        .then((project:Project) => stateService.updateState(project, 'downscaled', true))
        .then(resolve)
        .catch(err => jobService.kill(job.id, err));
    });
}

function processRenderJob(project,job) {
    /*
    * This function:
    *   - creates an SRT file containing the project subtitles
    *   - burns the SRT subtitle file onto the project source file
    *
    *   Note: 
    *   Each operation is performed async. Each component function passes the modified 'project' variable when resolving. 
    */

    return new Promise((resolve, reject) => {
        handleSubtitles(project)
          .then(project => storage.uploadFile(project, 'ass'))
          .then(project => stitch(project, job, progressHandler))
          // store
          .then((project:Project) => stateService.updateState(project, 'storingRender', true))
          .then(project => storage.uploadFile(project, 'render'))
          .then((project:Project) => stateService.updateState(project, 'storingRender', false))
          .then(resolve)
          .catch(err => jobService.kill(job.id, err));
    });
}

function handleSubtitles(project) {
  // check if a project contains subtitles
  // render .srt and .ass files if it does
  return new Promise((resolve, reject) => {
    if(project.hasAnnotations('subtitle')){
      logger.verbose('project has subtitles, preparing...');
      subtitle.makeAss(project)
        .then(resolve)
        .catch(errorHandler);
    } else{
      logger.verbose('project doesnt have subtitles, continue...');
      resolve(project);
    }
  });
}

function done(job) {
  // go to idle state
  logger.verbose("Done, new job possible");
  if(job['operation'] === 'render') busyProcessingStitch = false;
  if(job['operation'] === 'lowres') busyProcessingLowres = false;

  jobService.checkQueue(handleQueue);
}

function progressHandler(message, job, targetField) {
  // #todo updating the 'progress' value on the job triggers the listener, creating a feedback loop
  if (typeof message == 'object') { // this is an ffmpeg progress message
    jobService.updateFfmpegQueue(job, {'progress': message.progress});
    projectService.setProjectProperty(job.id, targetField, message.progress);
  }
}

function errorHandler(error) { 
  logger.error('Something went wrong while processing a job', error);
}
