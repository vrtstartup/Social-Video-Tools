import * as fs from 'fs';
import { config } from '../common/config';

const restler = require('restler');

const logger = config.logger; 

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

// routing
const baseUrl = `${config.routing.fileServer.protocol}://${config.routing.fileServer.domain}:${config.routing.fileServer.port}`;
const endpointUpload = `${baseUrl}/api/upload/overlay`;
const endpointUpdate = `${baseUrl}/api/templater/status`;

// assign parameters passed by bot to process 
// const filePath = process.argv[0];
// const projectId = process.argv[1];
// const overlayId = process.argv[2];

// mock values
const filePath = `/Users/matthiasdevriendt/Desktop/assets/kickoff_small.mp4`;
const projectId = `-KWY1VMWDCMhXguwsd57`;
const overlayId = '-KWY1dB3duD98DZMmshj'

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
          "video": restler.file(filePath, null, stats.size, null, config.encoding.format.video.mimeType)
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