const subtitle = require('subtitle');

import * as fs from 'fs';
import * as resolve from '../../common/services/resolver.service';
import { State } from '../../common/services/state.service';
import { logger } from '../../common/config/winston';

export class Subtitle {

  private fireBase;
  private state: State;
  private logger;

  constructor(fireBase:any) { 
    this.fireBase = fireBase;
    this.logger = logger;
    this.state = new State(this.fireBase, this.logger);
  }


  /*
  * given arbitrary project data, iterate over 'titles' property and 
  * add contents to a generated .srt file
  */
  makeSrt(project) {
    const subs = project.getAnnotations('subtitle');
    let arrKeys: any[] = Object.keys(subs);
    const file = resolve.getFilePathByType('srt', project.data.files.baseDir);
    const counter = 1;
    const captions = new subtitle();

    if(project.hasAnnotations('subtitle')){
      arrKeys.forEach((key: any) => {
        const sub = {
          start: String(subs[key]['start'] *= 1000),
          end: String(subs[key]['end'] *= 1000),
          text: subs[key]['text']
        }

        captions.add(sub);
      });
    }
    
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
          this.state.updateState(project, 'subtitles', true)
            .then(resolve)
        });
        stream.on('error', (err) => reject(err));
      });
    })
  }
}