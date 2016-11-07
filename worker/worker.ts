require('ts-node/register');

const subtitle = require('subtitle');
import * as path from 'path';
import * as fs from 'fs';
import { FireBase } from '../common/services/firebase.service';
import { ffprobe, scaleDown, burnSrt } from '../common/services/encoding.service';
import * as resolve from '../common/services/resolver.service';
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

function handleQueue(jobs){ 
  // does parsing return data? (e.g. not null etc)
  if(jobs && !busyProcessing) {
    logger.verbose("processing queue...");
    busyProcessing = true;

    getJob().then((data:any) => {
      // Process job
      // update the queue item status
      const job = data.job;
      jobKey = data.key;

      setInProgress(jobKey); // update job state

      // get project ref
      const refProject = db.ref(`projects/${job.projectId}`);
      refProject.once('value', (snapshot) => {
        // we have metadata
        const project = snapshot.val();
        projectId = snapshot.key;

        // try to execute the job
        handleJob(job.operation, project)
          .then((data) => {
            logger.verbose('successfully handled job...');
            fireBase.resolveJob(jobKey).then(done);
          }, (err) => { 
            // there's been a terrible error
            logger.error('job failed', err); // log the error 
            fireBase.killJob(jobKey, err); // remove job from processing queue
            done(); // next job 
          });
    }, (err) => {
      // handle errors thrown by firebase
      logger.error(err); 
      done();
    });
    }, (warning) => logger.warn(warning))
  }  
}

function handleJob(operation, project){
  return new Promise((resolve, reject) => {
    switch (operation) {
      case 'lowres':
          logger.verbose('handling lowres operation...');
          // promise.then(resolve) aka bubble up
          lowres(project).then(resolve, reject);
        break;
    
      case 'render':
        logger.verbose('handling render operation...');
        makeSrt(project).then(() => { 
          burnSrt(project.files.baseDir).then(resolve, reject);
          }, reject);
        break;
      default:
        logger.warn('handling unknown operation!');
        break;
    }
  });
}

function lowres(project) {
  return new Promise((resolve, reject) => {
    const baseDir = project.files.baseDir;
    // const baseDir = null; //serious error

    // perform an ffprobe 
    const probeData = ffprobe(baseDir, ffprobeHandler)
    .then(() => {
      scaleDown(messageHandler, baseDir)
        .then((data:any) => {
          const file = data.videoLowres;
          let operations = [];

          // update status
          fireBase.setProjectProperty(projectId, 'status/downscaled', true).then(resolve);
        }, (err) =>{
          logger.info("encode failed");
          logger.error(err);
          reject(err); // #todo handle promise rejections and error logging in the proper place
        });
    }, () => {
      logger.warn("no valid stream found");
    });
  });
}

// #todo subtitle service
function makeSrt(project){
  let arrKeys: any[] = Object.keys(project.subtitles);
  const file = resolve.getFilePathByType('subtitle', project.files.baseDir);
  const counter = 1;
  const captions = new subtitle();

  arrKeys.forEach((key:any) => {
    const sub = project.subtitles[key];

    // convert to ms
    sub.start *= 1000;
    sub.end *= 1000;

    captions.add(sub);
  });

  // Return a promise 
  return new Promise((resolve, reject) => {
    // wite to file 
    fs.open(file, 'w+', (err, fd) => {
      if (err) {
        if (err.code === "EEXIST") {
          logger.warn('.srt file already exists');
          reject(err);
          return;
        } else {
          throw err;
        }
      }

      const stream = fs.createWriteStream(file);
      stream.write(captions.stringify(), 'utf-8', () => {
        stream.close();
        fireBase.resolveJob(jobKey);

        // resolve with the path to the file we've just written to 
        resolve();
      });
      stream.on('error', (err) => reject(err));
    });
  })
}

function done(){
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


function listenQueue() {
  // listen to the queue object in database
  refProcess.on('value', (snapshot) => {
    // this runs when a new job is created in the queue.
    logger.verbose('got new queue data');
    const jobs = snapshot.val();

    // #todo make a pickJob function, this passing makes no sense
    handleQueue(jobs);
  }, (errorObject) => {
    logger.error(`The read failed: ${errorObject.code}`);
  });
}

function getJob() {
  // get the first job from the queue stack
  return new Promise((resolve, reject) => {
    refProcess.once('value', (snapshot) => {
      const jobs = snapshot.val(); // list of jobs
      const arrKeys = Object.keys(jobs);

      // loop over jobs
      for (let i=0 ; i < arrKeys.length ; i++ ) {
        const key = arrKeys[i];
        const job = jobs[key];

        if(job.status === 'open'){
          console.log('returning job');
          resolve({
            key: key,
            job: job
          });

          break;
        }
      }
      reject('No more jobs'); // no more available jobs
    });
  });
}

function messageHandler(message) {
  // #todo updating the 'progress' value on the job triggers the listener, creating a feedback loop
  if(typeof message == 'object' && message.hasOwnProperty("percent")) {
    // this is an ffmpeg progress message
    refProcess.child(jobKey).update({'progress': message.percent});
  }
}

function setInProgress(jobKey) {
  refProcess.child(jobKey).update({'status': 'in progress'});
}

function ffprobeHandler(data) {
  // update firebase with lip metadata
  fireBase.setProjectProperties(projectId, {clip: data});
}
