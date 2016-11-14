import * as fs from 'fs';
import { logger } from '../common/config/winston';

const config = require('../common/config/encoding');
const restler = require('restler');

/*
*
* Templater Bot runs this script whenever it finishes a rendering job. Input includes: 
*   
*   - Path to the rendered asset file
*   - Project or job ID needed for updating the project status
*
*
* This script should:
*   - Upload the rendered asset file to the remote server
*   - Update the project using the proper API endpoint
*
*/ 

// #todo config file 
const endpointUpload = `http://localhost:3000/api/upload/overlay`;
const endpointUpdate = `http://localhost:3000/api/templater/status`;

// assign parameters passed by bot to process 
// const filePath = process.argv[0];
// const projectId = process.argv[1];
// const overlayId = process.argv[2];

// mock values
const filePath = `/Users/matthiasdevriendt/Desktop/assets/kickoff_small.mp4`;
const projectId = `-KWXEY3yj4RRInCfe-Xb`;
const overlayId = '-KWXE_6cP8jFb8N1esnO'

// Upload file 
uploadVideo(filePath)
  .then(response => updateOverlayStatus(projectId, overlayId))
  .catch(errorHandler);

function uploadVideo( filePath ) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if(err) return reject(err);

      restler.post(endpointUpload, {
        multipart: true,
        data: {
          "projectId": projectId,
          "overlayId": overlayId,
          "video": restler.file(filePath, null, stats.size, null, config.format.video.mimeType)
        }
      }).on('complete', resolve);
    });
  });
}

function updateOverlayStatus(projectId, overlayId) {
  // perform a POST request to the proper api endpoint 
  return new Promise((resolve, reject) => {
    restler.post(endpointUpdate, { data: {
      "projectId": projectId,
      "overlayId": overlayId,
      "status": 'done',
    }})
      .on('complete', resolve)
      .on('error', reject);
  });
}

function errorHandler(err){ logger.error(err) }