import { resolve } from 'path';
import { fileConfig } from '../../common/config/files';
import * as fs from 'fs';
const mkdirp = require('mkdirp');

export function destinationDirectory(fileType:string, baseDirectory:string) {
  // return a fully resolved path to a project file's directory
  const workingDir = fileConfig.workingDirectory;
  const subDir = fileConfig.files[fileType].directory;

  return resolve(workingDir, baseDirectory, subDir);
}

export function destinationFile(fileType:string, baseDirectory:string, fileName:string) {
  //  return a fully resolved path to a project file
  const workingDir = fileConfig.workingDirectory;
  const subDir = fileConfig.files[fileType].directory;

  return resolve(workingDir, baseDirectory, subDir, fileName);
}

export function getFilePathByType(fileType:string, baseDirectory){
  // shoud be able to say "get me this project's source file"
  const file =  fileConfig.files[fileType];
  const workingDir = fileConfig.workingDirectory;
  const subDir = file.directory;
  const fileName = file.name;

  // resolve proper path
  const directory = resolve(workingDir, baseDirectory, subDir);
  let filePath = resolve(directory, fileName);

  if(file.extension) filePath = `${filePath}.${file.extension}`;

  return filePath;
}

export function getFileNameByType(fileType:string, baseDirectory:string) {
  // return an unresovled project file's name, including extension as configured
  const file =  fileConfig.files[fileType];
  let fileName = file.name;

  if(file.extension) fileName = `${fileName}.${file.extension}`;

  return fileName;
}

export function staticUrl(fileType:string, baseDirectory:string) {
  // return a public url to file in the static folder
  const file =  fileConfig.files[fileType]; //config
  const fileName = this.getFileNameByType(fileType, baseDirectory);

  // #todo how do I get the base URL here ? 
  return `http://localhost:3000/video/${baseDirectory}/${file.directory}/${fileName}`;
}

export function makeProjectDirectories(baseDirectory:string) {
  const files = fileConfig.files;
  const projectsDir = fileConfig.workingDirectory;

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