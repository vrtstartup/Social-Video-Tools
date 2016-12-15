const subtitle = require('subtitle');

import * as fs from 'fs';
import * as resolve from '../../common/services/resolver.service';
import { logger } from '../../common/config/winston';
import { Project } from '../classes/project';

export class Subtitle {

  constructor() {}

  makeAss(project: Project){
    const file = resolve.getProjectFilePath('ass', project.data.files.baseDir, true);

    const subtitles = project.getAnnotations('subtitle')
    return new Promise((resolve, reject) => {

      // open file 
      fs.open(file, 'w+', (err, fd) => {
        if (err) {
          if (err.code === "EEXIST") {
            logger.warn('.ass file already exists');
            reject(err);
            return;
          } else {
            throw err;
          }
        }

      // initiate write stream
      const stream = fs.createWriteStream(file);
          
      // write script info
      stream.write('[Script Info]\n', 'utf-8');
      stream.write('Title: Nieuwshub subtitles\n');
      stream.write('ScriptType: v4.00\n');
      stream.write('Collisions: Normal\n\n');

      // write styles to file 
      stream.write('[V4 Styles]\n');
      stream.write('Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n');

      // loop over available styles  
      let arrKeys = Object.keys(subtitles); 
      let arrStyles = [];

      arrKeys.forEach(i => {
        const style = subtitles[i]['data']['ass'];
        if(arrStyles.indexOf(style['name']) === -1){
          stream.write(this.formatStyle(style));
          arrStyles.push(style['name']);
        }
      });

      stream.write('[Events]\n');
      stream.write('Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n');

      arrKeys = Object.keys(subtitles);
      arrKeys.forEach(i => {
        const sub = subtitles[i];
        const line = this.formatEvent(sub);
        stream.write(line);
      });

      stream.write('\n', 'utf8', () => stream.end());
      
      stream.on('error', (err) => reject(err));
      stream.on('close', (data) => resolve(project));
      })
    });
  }

  private formatStyle(data: Object): string{
    const primaryColour = parseInt(data['primaryColour']);
    const secondaryColour = parseInt(data['secondaryColour']);
    const outlineColour = parseInt(data['outlineColour']);
    const backColour = parseInt(data['backColour']);

    const bold = data['bold'] ? '-1' : '0';
    const italic = data['italic'] ? '-1' : '0';
    const underline = data['underline'] ? '-1' : '0';
    const strikeout = data['strikeout'] ? '-1' : '0';

    return `Style: ${data['name']},${data['fontname']},${data['fontsize']},${primaryColour},${secondaryColour},${outlineColour},${backColour},${bold},${italic},${underline},${strikeout},100,100,0,0,1,1,0,2,5,5,30,1\n`
  }

  private formatEvent(sub: Object){
    const start = this.formatTime(sub['start']);
    const end = this.formatTime(sub['end']);
    const style = sub['data']['ass']['name'];
    const name = sub['key'];
    const data = sub['data'];
    const text = sub['data']['text']['textInpt01']['text'];

    return `Dialogue: 0,${start},${end},${style},${name},0,0,0,,${text}\n`
  }

  private formatTime(time: number): string{
    // time represents an amount in seconds as a float value
    const s = time; 
    const totalMinutes = Math.floor(s/60);
    const seconds = Math.round(s%60*100) / 100; //round to two decimal places

    const hrs = Math.floor(totalMinutes/60);
    const minutes = totalMinutes - (hrs*60);

    // format seconds
    const fSeconds = seconds.toFixed(2);
    // format minutes to be h:mm:ss format compliant
    const fMinutes = (Math.floor(minutes/10) >= 1) ? minutes : `0${minutes}`;

    return `${hrs}:${fMinutes}:${fSeconds}`;
  }
}