require('ts-node/register');

import * as fs from 'fs';
import { FireBase } from '../common/firebase/firebase.service';
import { ffprobe, ffmpeg } from './services/ffmpeg.service'

// init database 
const db = FireBase.database();

// Listen to process queue
const refProcess = db.ref('to-process');

// Attach an asynchronous callback to read the data at our posts reference
refProcess.on('value', (snapshot) => {
  // this runs when a new job is created in the queue.
  let docs = snapshot.val();

  if(docs) {
    const firstProject = docs[Object.keys(docs)[0]];

    // get project ref
    const refProject = db.ref(`projects/${firstProject.projectId}`);
    // #todo: projectId frontend request
    refProject.on('value', (snapshot) => {
      // we have metadata
      const project = snapshot.val();

      // now read the file from the disk
      const filePath = `${project.baseDir}/${project.clip.fileName}`;
      const fileMeta = fs.statSync(filePath);

      // perform an ffprobe 
      const probeData = ffprobe( console, filePath );
      
      console.log(fileMeta);
    })
  }  
}, (errorObject) => {
  console.log(`The read failed: ${errorObject.code}`);
});
