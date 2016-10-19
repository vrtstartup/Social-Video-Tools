require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs'); 

firebase.initializeApp({
  serviceAccount: path.resolve(`${__dirname}/config/firebase/key.json`),
  databaseURL: 'https://socialvideotool.firebaseio.com',
});

const db = firebase.database();

// read the project mock
const mockfile = path.join(__dirname, 'mock/project.json');
const project = JSON.parse(fs.readFileSync(mockfile, 'utf8'));

// store project
const refProjects = db.ref('projects');

refProjects.push(project);



// Listen to process queue
const refProcess = db.ref('to-process');

// Attach an asynchronous callback to read the data at our posts reference
refProcess.on('value', (snapshot) => {
  // this runs when a new job is created in the queue.
  let docs = snapshot.val();
  
  if(docs) {
    for (first in docs) break;
    const objProject = docs[first];

    // get project ref
    const refProject = db.ref(`projects/${objProject.projectId}`);
    // #todo: projectId frontend request
    console.log(objProject.projectId);
    refProject.on('value', (snapshot) => {
      console.log(snapshot.val());
    })
  }  
}, (errorObject) => {
  console.log(`The read failed: ${errorObject.code}`);
});
