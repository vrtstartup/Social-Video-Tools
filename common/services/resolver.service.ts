import { resolve } from 'path';
import { config } from '../../common/config'

export function destinationDirectory(fileType:string, baseDirectory:string) {
  const workingDir = config.workingDirectory;
  const subDir = config.subDirectories[fileType];

  return resolve(workingDir, baseDirectory, subDir);
}

export function destinationFile(fileType:string, baseDirectory:string, fileName:string) {
  const workingDir = config.workingDirectory;
  const subDir = config.subDirectories[fileType];

  return resolve(workingDir, baseDirectory, subDir, fileName);
}

export function getFilePathByType(fileType:string, baseDirectory){
  // shoud be able to say "get me this project's source file"
  const workingDir = config.workingDirectory;
  const subDir = config.subDirectories[fileType];
  const fileName = config.fileNames[fileType];

  return resolve(workingDir, baseDirectory, subDir, fileName);
}