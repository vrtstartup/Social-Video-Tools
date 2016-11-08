const subtitle = require('subtitle');

import * as fs from 'fs';
import * as resolve from '../../common/services/resolver.service';
import { logger } from '../../common/config/winston';

/*
* given arbitrary project data, iterate over 'titles' property and 
* add contents to a generated .srt file
*/
export function makeSrt(project) {
  let arrKeys: any[] = Object.keys(project.subtitles);
  const file = resolve.getFilePathByType('subtitle', project.files.baseDir);
  const counter = 1;
  const captions = new subtitle();

  arrKeys.forEach((key: any) => {
    const sub = project.subtitles[key];

    // convert to ms
    sub.start *= 1000;
    sub.end *= 1000;

    captions.add(sub);
  });

  // Return a promise 
  return new Promise((resolve, reject) => {
    // wite to file 
    fs.open(file, 'w+', (err, fd) => {
      if (err) {
        if (err.code === "EEXIST") {
          logger.warn('.srt file already exists');
          reject(err);
          return;
        } else {
          throw err;
        }
      }

      const stream = fs.createWriteStream(file);
      stream.write(captions.stringify(), 'utf-8', () => {
        stream.close();
        resolve(project);
      });
      stream.on('error', (err) => reject(err));
    });
  })
}