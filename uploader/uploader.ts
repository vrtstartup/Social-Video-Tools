import * as fs from 'fs';
import { routingConfig } from '../common/config/routing';
import { encodingConfig } from '../common/config/encoding';
import { uploader } from '../common/config/uploader';
import { logger } from '../common/config/winston';

const path = require('path');
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

// routing
const baseUrl = `${routingConfig.fileServer.protocol}://${routingConfig.fileServer.domain}`;
const endpointUpload = `${baseUrl}/api/upload/overlay`;
const endpointUpdate = `${baseUrl}/api/templater/status`;

// assign parameters passed by bot to process 
const filePath = path.resolve(uploader.outFolder, `${process.argv[2]}.${uploader.fileExtension}`);
const projectId = process.argv[3];
const overlayId = process.argv[4];

// mock values
// const filePath = `/Users/matthiasdevriendt/Movies/vrt_test/asset.mov`;
// const projectId = `-KZ0rIcAlIo6wSkw7003`;
// const overlayId = '-ANNOE5K644ELJJC2313';

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
          "video": restler.file(filePath, null, stats.size, null, encodingConfig.format.video.mimeType)
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