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

export function destinationFile(fileType:string, baseDirectory:string, fileName:string) {
  //  return a fully resolved path to a project file
  const workingDir = config.filesystem.workingDirectory;
  const subDir = config.filesystem.files[fileType].directory;

  return resolve(workingDir, baseDirectory, subDir, fileName);
}

export function getFilePathByType(fileType:string, baseDirectory?:string, fileId?:string){
  // if baseDirectory isnt given, default to the shared directory
  const baseDir = baseDirectory ? baseDirectory : config.filesystem.sharedDirectory;

  // shoud be able to say "get me this project's source file"
  const file =  config.filesystem.files[fileType];
  const workingDir = config.filesystem.workingDirectory;
  const subDir = file.directory;
  const fileName = file.name;

  // resolve proper path
  const directory = resolve(workingDir, baseDir, subDir);
  let filePath = (fileType == 'overlay') ? resolve(directory, `${fileId}${fileName}`) : resolve(directory, fileName);

  if(file.extension) filePath = `${filePath}.${file.extension}`;

  return filePath;
}

export function getFileNameByType(fileType:string, baseDirectory:string) {
  // return an unresovled project file's name, including extension as configured
  const file =  config.filesystem.files[fileType];
  let fileName = file.name;

  if(file.extension) fileName = `${fileName}.${file.extension}`;

  return fileName;
}

export function staticUrl(fileType:string, baseDirectory:string) {
  // return a public url to file in the static folder
  const file =  config.filesystem.files[fileType]; //config
  const fileName = this.getFileNameByType(fileType, baseDirectory);

  return `${fServer.protocol}://${fServer.domain}:${fServer.port}/video/${baseDirectory}/${file.directory}/${fileName}`;
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