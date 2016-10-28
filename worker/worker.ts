require('ts-node/register');

const subtitle = require('subtitle');
import * as path from 'path';
import * as fs from 'fs';
import { FireBase } from '../common/firebase/firebase.service';
import { ffprobe, scaleDown } from './services/ffmpeg.service';

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
      projectId = snapshot.key;

      handleOperation(job.operation, project);
    })
  }  
}, (errorObject) => {
  console.log(`The read failed: ${errorObject.code}`);
});


function handleOperation(op, project){
  switch (op) {
    case 'lowres':
        console.log('handling lowres operation...');
        lowres(project);
      break;
  
    case 'render':
      console.log('handling render operation...');
      makeSrt(project);
      break;
    default:
      console.warn('handling unknown operation!');
      break;
  }
}

function lowres(project) {
  const dir = project.baseDir;
  const file = project.clip.fileName;
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

function makeSrt(project){
  let arrKeys: any[] = Object.keys(project.subtitles);
  const file = path.resolve(`${project.baseDir}/${project.clip.fileName}.srt`);
  const counter = 1;
  const captions = new subtitle();

  arrKeys.forEach((key:any) => {
    const sub = project.subtitles[key];

    // convert to ms
    sub.start *= 1000;
    sub.end *= 1000;

    captions.add(sub);
  });

  // wite to file 
  fs.open(file, 'wx', (err, fd) => {
    if (err) {
      if (err.code === "EEXIST") {
        console.error('.srt file already exists');
        return;
      } else {
        throw err;
      }
    }

    const stream = fs.createWriteStream(file);
    stream.write(captions.stringify(), 'utf-8', () => {
      console.log('done!');
      stream.close();
      fireBase.resolveJob(jobKey);
    });
    stream.on('error', (err) => console.log(err));
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
