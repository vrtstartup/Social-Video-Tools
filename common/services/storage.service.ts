import * as fs from 'fs';
import * as aws from 'aws-sdk';
// const writeStr
import * as resolver from '../../common/services/resolver.service';
import { Project } from '../../common/classes/project';
import { logger } from '../../common/config/winston';
import { fileConfig } from '../../common/config/files';

aws.config.update({region: 'eu-central-1'}); //#todo move to configuration file

const  s3 = new aws.S3({signatureVersion: 'v4'});

export function uploadFile(project, fileType: string){
  // get file 
  const filePath = resolver.getProjectFilePath(fileType, project['data']['id']);
  logger.info(`Uploading files for ${project.data.id}`);
  
  return new Promise((resolve, reject) => {
    fs.readFile(filePath,(err, fileBuffer) => {
      if(err) logger.error(`could not read ${fileType} file.`);
      
      s3.putObject({
        ACL: 'public-read',
        Bucket: 'social-video-tools',
        Key: resolver.getProjectFileKey(fileType,project['data']['id']),
        Body: fileBuffer,
        ContentType: fileConfig.files[fileType]['mime']
      }, (err, resp) => {
        if(err) logger.error(err);
        logger.info(`Upload done.`);
        
        resolve(project);
      }).on('httpUploadProgress', (progress) => {
        logger.info(progress.loaded + " of " + progress.total + " bytes");
      });
      
    })
  });
}

export function signUrl(fileType:string, fileExtension: string, projectId: string) {
  /*
  * sign an url so a client can make a call directly to S3
  */
  const fileKey = resolver.getProjectFileKey(fileType, projectId);

  const s3Params = {
    Bucket: 'social-video-tools',
    Key: fileKey,
    Expires: 60,
    ContentType: fileType,
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