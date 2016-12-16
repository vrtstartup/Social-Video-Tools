import { resolve } from 'path';
import { config } from '../../common/config';
import * as fs from 'fs';
const mkdirp = require('mkdirp');

const fServer = config.routing.fileServer;

export function isSharedFile(type: string){ 
  const fileConfig = getFileConfigByType(type);
  return fileConfig.hasOwnProperty('shared') && fileConfig['shared'];
}

export function isUniqueFile(type: string) {
  const fileConfig = getFileConfigByType(type);
  return fileConfig.hasOwnProperty('name');
}

export function getMimeTypeByFileType(type: string): string{ return config.filesystem.files[type]['mime']}
function getFileConfigByType(type: string): Object{ return config.filesystem.files[type] }

export function getFileNameByType(fileType:string, fileId?:string) {
  // return an unresovled project file's name, including extension as configured
  const file =  config.filesystem.files[fileType];
  let fileName = file.hasOwnProperty('name') ? file.name : fileId;

  if(file.extension) fileName = `${fileName}.${file.extension}`;

  return fileName;
}

function getParentPropertyByFileType(fileType: string): string{
  const file = config.filesystem.files[fileType];
  return file['directory'];
}

export function getProjectFilePath(type: string, projectName: string, includeExt?: boolean, fileName?: any){
  // return a fully resolved path to a LOCAL (temporary) project file:
  //    i.e. /app/data/-xfdgjlksjd234source.mp4
  //
  // this function is used to temporarily store ffmpeg output (lowres, render) and ASS subtitle files
  // before uploading them to S3
  const fileConfig = getFileConfigByType(type);
  const workingDir = config.filesystem.workingDirectory;
  const fName = fileName ? fileName : fileConfig['name']; // if fileName is not explicitly set, it's a unique file whose name has been set in the config 
  const ext = fileConfig['extension'];

  let filePath = resolve(workingDir, `${projectName}${fName}`);
  if(includeExt) filePath = `${filePath}.${ext}`;

  return filePath;
}

/*
* S3 related stuff 
*
*/ 
export function getProjectFileKey(fileType: string, projectId: string, fileName?: any): string{
  // return the key of an object stored in a remote s3 bucket
  const fileConfig = getFileConfigByType(fileType);
  const parentProp = getParentPropertyByFileType(fileType);
  const fName = fileName ? fileName : fileConfig['name']; // if fileName is not explicitly set (overlay), it's a unique file whose name has been set in the config 
  const ext = fileConfig['extension'];

  return `${parentProp}/${projectId}/${fName}.${ext}`;
}

export function storageUrl(fileType:string, baseDirectory:string, annotationId?: any){
  // return public url to file in s3 bucket
  const parentProp = getParentPropertyByFileType(fileType);
  const file =  config.filesystem.files[fileType];
  const fileName = annotationId ?  annotationId : getFileNameByType(fileType);

  return `https://s3.${config.storage.region}.amazonaws.com/${config.storage.bucket}/${parentProp}/${baseDirectory}/${fileName}`;
}