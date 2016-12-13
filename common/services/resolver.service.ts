import { resolve } from 'path';
import { config } from '../../common/config';
import * as fs from 'fs';
const mkdirp = require('mkdirp');

const fServer = config.routing.fileServer;


export function destinationDirectory(fileType:string, baseDirectory:string) {
  // return a fully resolved path to a project file's directory
  const workingDir = config.filesystem.workingDirectory;
  const subDir = config.filesystem.files[fileType].directory;

  return resolve(workingDir, baseDirectory, subDir);
}

export function destinationFile(fileType:string, projectId:string, fileName:string) {
  //  return a fully resolved path to a project file
  const workingDir = config.filesystem.workingDirectory;
  // const subDir = config.filesystem.files[fileType].directory;

  return resolve(workingDir, `${projectId}${fileName}`);
}

export function isSharedFile(type: string){ 
  const fileConfig = getFileConfigByType(type);
  return fileConfig.hasOwnProperty('shared') && fileConfig['shared'];
}

export function isUniqueFile(type: string) {
  const fileConfig = getFileConfigByType(type);
  return fileConfig.hasOwnProperty('name');
}

function getFileConfigByType(type: string): Object{ return config.filesystem.files[type] }

export function getSharedFilePath(type: string, fileName: string) {
  // get configuration 
  const fileConfig = getFileConfigByType(type);
  const workingDir = config.filesystem.workingDirectory;
  const sharedDir = config.filesystem.sharedDirectory;
  const subDir = fileConfig['directory'];
  const ext = fileConfig['extension'];

  return resolve(workingDir, sharedDir, subDir, `${fileName}.${ext}`);
}

export function getProjectFilePath(type: string, projectName: string, fileName?: any){
  const fileConfig = getFileConfigByType(type);
  const workingDir = config.filesystem.workingDirectory;
  // const subDir = fileConfig['directory'];
  const fName = fileName ? fileName : fileConfig['name']; // if fileName is not explicitly set, it's a unique file whose name has been set in the config 
  const ext = fileConfig['extension'];

  return resolve(workingDir, `${projectName}${fName}.${ext}`);
}

export function getProjectFileKey(type: string, projectId: string, fileName?: any): string{
  const fileConfig = getFileConfigByType(type);
  const fName = fileName ? fileName : fileConfig['name']; // if fileName is not explicitly set (overlay), it's a unique file whose name has been set in the config 
  const ext = fileConfig['extension'];

  return `${projectId}/${fName}.${ext}`;
}

export function getFileNameByType(fileType:string, fileId?:string) {
  // return an unresovled project file's name, including extension as configured
  const file =  config.filesystem.files[fileType];
  let fileName = file.hasOwnProperty('name') ? file.name : fileId;

  if(file.extension) fileName = `${fileName}.${file.extension}`;

  return fileName;
}

export function storageUrl(fileType:string, baseDirectory:string){
  // return public url to file in s3 bucket
  const file =  config.filesystem.files[fileType]; //config
  const fileName = this.getFileNameByType(fileType);

  return `https://s3.${config.storage.region}.amazonaws.com/${config.storage.bucket}/${baseDirectory}/${fileName}`;
}

export function makeProjectDirectories(baseDirectory:string) {
  const files = config.filesystem.files;
  const projectsDir = config.filesystem.workingDirectory;

  // make project directory
  if ( !fs.existsSync(projectsDir) ) fs.mkdirSync(projectsDir);

  // make subdirectories
  Object.keys(files).forEach((key) => {
    const fileType = key;
    const directory = destinationDirectory(fileType, baseDirectory);

    try {
      // see if we can get data for this directory..
      const stat = fs.statSync(directory);
    } catch (err){
      // we couldnt, make directory recursively
      mkdirp.sync(directory);
    }
  })
}