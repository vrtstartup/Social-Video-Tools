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

// Listen to process queue
const refProcess = db.ref('to-process');
let busyProcessing = false;

// #todo: the way these variables are scoped isn't that great
let jobKey;
let projectId;

// listen to the queue object 
refProcess.on('value', (snapshot) => {
  // this runs when a new job is created in the queue.
  const jobs = snapshot.val();

  // does parsing return data? (e.g. not null etc)
  if(jobs && !busyProcessing) {
    logger.verbose("lets process");
    busyProcessing = true;
    jobKey = Object.keys(jobs)[0];
    const job = jobs[jobKey];

    // update the queue item status
    setInProgress(jobKey);

    // get project ref
    const refProject = db.ref(`projects/${job.projectId}`);
    // #todo: projectId frontend request
    refProject.once('value', (snapshot) => {
      // we have metadata
      const project = snapshot.val();
      projectId = snapshot.key;

      handleOperation(job.operation, project);
    })
  }  
}, (errorObject) => {
  logger.error(`The read failed: ${errorObject.code}`);
});


function handleOperation(op, project){
  switch (op) {
    case 'lowres':
        logger.verbose('handling lowres operation...');
        lowres(project);
      break;
  
    case 'render':
      logger.verbose('handling render operation...');
      makeSrt(project).then((pathToSrtFile) => { 
        fireBase.setProjectProperty(projectId, 'srtPath', pathToSrtFile);
        burnSrt(project.files.baseDir).then(done);
        }, (err) => logger.error(err));
      break;
    default:
      logger.warn('handling unknown operation!');
      break;
  }
}

function lowres(project) {
  const baseDir = project.files.baseDir;

  // perform an ffprobe 
  const probeData = ffprobe(baseDir, ffprobeHandler)
  .then(() => {
    scaleDown(messageHandler, baseDir)
      .then((data:any) => {
        const file = data.videoLowres;
        let operations = [];

        // update status
        operations.push(fireBase.setProjectProperty(projectId, 'status/downscaled', true));

        Promise.all(operations)
          .then(fireBase.resolveJob(jobKey))
          .then(done);
      }, (err) =>{
        logger.info("encode failed");
        logger.error(err);
      });
  }, () => {
    logger.warn("no valid stream found");
  });
}

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
    fs.open(file, 'wx', (err, fd) => {
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
        resolve(file);
      });
      stream.on('error', (err) => reject(err));
    });
  })
}

function done(){
  logger.verbose("Done, new job possible");
  busyProcessing = false;
}

function messageHandler(message) {
  // #todo: log to some general log handler here (i.e. papertrail)
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
