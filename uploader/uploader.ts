import * as fs from 'fs';
import { Observable } from 'rxjs/Rx';
import { routingConfig } from '../common/config/routing';
import { encodingConfig } from '../common/config/encoding';
import { uploader } from '../common/config/uploader';
import { logger } from '../common/config/winston';

const path = require('path');
const restler = require('restler');
const req = require('request');

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
// const baseUrl = `http://localhost:3000`;
const baseUrl = `${routingConfig.fileServer.protocol}://${routingConfig.fileServer.domain}`;
const endpointUpload = `${baseUrl}/api/upload/sign-s3`;
const endpointUpdate = `${baseUrl}/api/templater/status`;

// assign parameters passed by bot to process 
const filePath = path.resolve(uploader.outFolder, `${process.argv[2]}.${uploader.fileExtension}`);
const projectId = process.argv[3];
const overlayId = process.argv[4];

// mock values
// const filePath = `/Users/matthiasdevriendt/Movies/vrt_test/asset.mov`;
// const projectId = `-KZ7FH-EQ4VI01QuqUYL`;
// const overlayId = '-ANNO6HF4G57DI03DFJ0';

// Upload file 
signRequest(filePath)
  .then(sendRequest)
  .then(response => updateOverlayStatus(projectId, overlayId))
  .catch(errorHandler);

function signRequest( filePath ) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if(err) return reject(err);

      // get signed request
      // #todo urlencode and decode
      restler.get(`${endpointUpload}?project-id=${projectId}&annotation-id=${overlayId}&file-type=overlay&file-ext=${uploader.fileExtension}`)
        .on('complete', resolve)
        .on('error', reject);
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

function sendRequest(data: Object){
  const url = data['signedRequest'];
  const stream = getFileStream(filePath);
  const stats = fs.statSync(filePath);

  return new Promise((resolve, reject) => {
    stream.pipe(req({
      method: "PUT",
      uri: url,
      headers: {
        'Content-Length': stats['size']
      }
    }, (err, res, body) => {
      if(err) reject(err);
      resolve(body);
    }))
  });
}

function getFileStream(filePath: string){
  return fs.createReadStream(filePath);
}

function uploadFile(file: File, signedRequest: string){
    return Observable.create( observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedRequest);

      xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            observer.next(xhr.response);
            observer.complete();
          } else{
            console.log(xhr.responseText);
            console.log('could not upload file');
          }
        };
      };

      xhr.upload.onprogress = (event) => {
        this.progress = Math.round(event.loaded / event.total * 100);
        
        this.progressObserver
          .next(this.progress)
        };

      xhr.upload.onerror = (e) => { observer.error(e);}
      xhr.upload.ontimeout = (e) => { observer.error(e);}

      xhr.send(file);
    });
  }

function errorHandler(err){ logger.error(err) }