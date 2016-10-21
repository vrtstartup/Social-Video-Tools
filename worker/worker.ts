require('ts-node/register');

import * as fs from 'fs';
import { FireBase } from '../common/firebase/firebase.service';
import { ffprobe, ffmpeg, scaleDown } from './services/ffmpeg.service'

// init database 
// const db = FireBase.database();
const fireBase = new FireBase();
const db = fireBase.getDatabase();

// Listen to process queue
const refProcess = db.ref('to-process');

// Attach an asynchronous callback to read the data at our posts reference
refProcess.on('value', (snapshot) => {
  // this runs when a new job is created in the queue.
  let docs = snapshot.val();

  // does parsing return data? (e.g. not null etc)
  if(docs) {
    const jobKey = Object.keys(docs)[0];
    const firstProject = docs[jobKey];

    // get project ref
    const refProject = db.ref(`projects/${firstProject.projectId}`);
    // #todo: projectId frontend request
    refProject.on('value', (snapshot) => {
      // we have metadata
      const project = snapshot.val();
      const dir = project.baseDir;
      const file = project.clip.fileName;
      const projectId = snapshot.key;

      // now read the file from the disk
      const filePath = `${dir}/${file}`;

      // perform an ffprobe 
      const probeData = ffprobe( console, filePath )
      .then(() => {
        console.log("valid stream found");

        scaleDown(console, file, dir)
          .then((data:any) => {
            const file = data.videoLowres;
            fireBase.setProjectProperty(projectId, 'clip/lowResFileName' ,file);
            fireBase.resolveJob(jobKey);
            console.log(data);
            console.log("job done.");
          }, (err) =>{
            console.log("encode failed");
            console.log(err);
          });
      }, () => {
        console.log("no valid stream found");
      });

    })
  }  
}, (errorObject) => {
  console.log(`The read failed: ${errorObject.code}`);
});
