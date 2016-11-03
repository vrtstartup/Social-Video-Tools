import { resolve } from 'path';
import { appConfig } from '../../common/config.temp'

export function destinationDirectory(fileType:string, baseDirectory:string) {
  const workingDir = appConfig.workingDirectory;
  const subDir = appConfig.subDirectories[fileType];

  return resolve(workingDir, baseDirectory, subDir);
}

export function destinationFile(fileType:string, baseDirectory:string, fileName:string) {
  const workingDir = appConfig.workingDirectory;
  const subDir = appConfig.subDirectories[fileType];

  return resolve(workingDir, baseDirectory, subDir, fileName);
}

export function getFilePathByType(fileType:string, baseDirectory){
  // shoud be able to say "get me this project's source file"
  const workingDir = appConfig.workingDirectory;
  const subDir = appConfig.subDirectories[fileType];
  const fileName = appConfig.fileNames[fileType];

  return resolve(workingDir, baseDirectory, subDir, fileName);
}