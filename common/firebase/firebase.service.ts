require('ts-node/register');

const firebase = require('firebase');
const path = require('path');
const fs = require('fs'); 

export module FireBase {
  export function database() {
    // this operation is synchronous
    firebase.initializeApp({
      serviceAccount: path.resolve(`./common/firebase/key.json`),
      databaseURL: 'https://socialvideotool.firebaseio.com',
    });

    return firebase.database(); 
  }

  export function queue(projectId) {
    const refQueue = database().ref('to-process');

    refQueue.push({ 
      "projectId": projectId,
      "job": "lowres",
      "status": "open"
    });
  }
}
