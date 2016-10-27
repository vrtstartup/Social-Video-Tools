require('ts-node/register');

import * as fs from 'fs';
import { FireBase } from '../common/firebase/firebase.service';
import { ffprobe, scaleDown } from './services/ffmpeg.service'

// init database 
// const db = FireBase.database();
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
    console.log("lets process");
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
      const dir = project.baseDir;
      const file = project.clip.fileName;
      projectId = snapshot.key;

      handleOperation(job.operation, file, dir);
    })
  }  
}, (errorObject) => {
  console.log(`The read failed: ${errorObject.code}`);
});


function handleOperation(op, file, dir){
  switch (op) {
    case 'lowres':
        console.log('handling lowres operation...');
        lowres(file, dir);
      break;
  
    case 'render':
      console.log('handling render operation...');
      break;
    default:
      console.warn('handlin unknown operation!');
      break;
  }
}

function lowres(file, dir) {
  const filePath = `${dir}/${file}`;

  // perform an ffprobe 
  const probeData = ffprobe(filePath, ffprobeHandler)
  .then(() => {
    scaleDown(messageHandler, file, dir)
      .then((data:any) => {
        const file = data.videoLowres;
        let operations = [];

        // set properties in firebase
        operations.push(fireBase.setProjectProperty(projectId, 'clip/lowResFileName' ,file));
        operations.push(fireBase.setProjectProperty(projectId, 'status/downscaled', true));

        Promise.all(operations)
          .then(fireBase.resolveJob(jobKey))
          .then(done);
      }, (err) =>{
        console.log("encode failed");
        console.log(err);
      });
  }, () => {
    console.log("no valid stream found");
  });
}

function done(){
  console.log("Done, new job possible");
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
