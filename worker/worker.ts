require('ts-node/register');

import { FireBase } from '../common/firebase/firebase.service';

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
      console.log(snapshot.val());
    })
  }  
}, (errorObject) => {
  console.log(`The read failed: ${errorObject.code}`);
});
