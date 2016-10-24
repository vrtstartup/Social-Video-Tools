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

// Attach an asynchronous callback to read the data at our posts reference
refProcess.on('value', (snapshot) => {
  // this runs when a new job is created in the queue.
  let docs = snapshot.val();

  // does parsing return data? (e.g. not null etc)
  if(docs && !busyProcessing) {
    console.log("lets process");
    busyProcessing = true;
    const jobKey = Object.keys(docs)[0];
    const firstProject = docs[jobKey];

    // get project ref
    const refProject = db.ref(`projects/${firstProject.projectId}`);
    // #todo: projectId frontend request
    refProject.once('value', (snapshot) => {
      // we have metadata
      const project = snapshot.val();
      const dir = project.baseDir;
      const file = project.clip.fileName;
      const projectId = snapshot.key;

      // now read the file from the disk
      const filePath = `${dir}/${file}`;
      console.log("got project data");

      // perform an ffprobe 
      const probeData = ffprobe( console, filePath )
      .then(() => {

        fireBase.resolveJob(jobKey);

        scaleDown(console, file, dir)
          .then((data:any) => {
            const file = data.videoLowres;

            let operations = [];

            // set properties in firebase
            operations.push(fireBase.setProjectProperty(projectId, 'clip/lowResFileName' ,file));
            operations.push(fireBase.setProjectProperty(projectId, 'status/downscaled', true));

            Promise.all(operations).then(done);
            
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

function done(){
  console.log("Done, new job possible");
  busyProcessing = false;
}
