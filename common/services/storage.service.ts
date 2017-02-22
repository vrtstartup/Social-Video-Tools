import * as fs from 'fs';
import * as aws from 'aws-sdk';
import * as resolver from '../../common/services/resolver.service';
import { Project } from '../../common/classes/project';
import { logger } from '../../common/config/winston';
import { fileConfig } from '../../common/config/files';
import { storage } from  '../../common/config/s3'
import { db } from '../../common/services/firebase.service';

var diskspace = require('diskspace');

aws.config.update({region: storage.region}); //#todo move to configuration file

const  s3 = new aws.S3({signatureVersion: 'v4'});

export function uploadFile(project, fileType: string){
  // get file 
  const filePath = resolver.getProjectFilePath(fileType, project['data']['id'], true);
  logger.info(`Uploading files for ${project.data.id}`);
  
  return new Promise((resolve, reject) => {
    fs.readFile(filePath,(err, fileBuffer) => {
      if(err){
        logger.warn(`${fileType} file at path ${filePath} seems to be empty. Aborting upload`);
        resolve(project);
      }else{
        s3.putObject({
          ACL: 'public-read',
          Bucket: storage.bucket,
          Key: resolver.getProjectFileKey(fileType,project['data']['id']),
          Body: fileBuffer,
          ContentType: fileConfig.files[fileType]['mime']
        }, (err, resp) => {
          if(err) logger.error(err);
          
          resolve(project);
          if(fileType !== 'ass') deleteFile(filePath);
        }).on('httpUploadProgress', progress => {
          logger.info(progress.loaded + " of " + progress.total + " bytes: ", (progress.loaded / progress.total)*100 + '%');
        });
      }
    })
  });
}

export function signUrl(fileType:string, fileExtension: string, projectId: string, annotationId?: string) {
  /*
  * sign an url so a client can make a call directly to S3
  */
  const fileKey = (fileType === 'overlay') ? resolver.getProjectFileKey(fileType, projectId, annotationId) : resolver.getProjectFileKey(fileType, projectId);
  const mimeType = resolver.getMimeTypeByFileType(fileType);

  const s3Params = {
    Bucket: storage.bucket,
    Key: fileKey,
    Expires: 60,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if(err) {
        logger.error(err);
        reject(err);
      }; 
      
      resolve({ signedRequest: data});
    });
  })
};

export function getReadStream(fileType:string, projectId: string){
  const fileKey = resolver.getProjectFileKey(fileType, projectId);

  const s3Params = {
    Bucket: storage.bucket,
    Key: fileKey,
    Stream: true
  };

  return new Promise((resolve, reject) => {
    s3.getObject(s3Params, (err, data) => {
      if(err) {
        logger.error(err);
        reject(err);
      }; 

      resolve(data);
    });
  });
}

function deleteFile(filePath: string){ fs.unlink(filePath) }

export function checkStorageLeft(){
  const infoRef = db.ref('info/disk');

  diskspace.check('/', (err, total, free, status) =>{
    if(err) {
      console.error('could not check remaining disk space');
      return;
    }

    const pctFree = (free/total)*100;

    infoRef.set({
      percentageFree: Math.round(pctFree),
      err: err,
      meta: {
        total: total,
        free: free,
        status: status
      }
      
    }).then(
      () => console.info('updated disk space'), 
      () => {console.error('could not update disk space')});
  });
}