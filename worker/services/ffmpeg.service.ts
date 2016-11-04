// #todo: rename to encoding.service
import {spawn, spawnSync, execFile} from 'child_process';
import * as resolve from '../../common/services/resolver.service';
var FfmpegCommand = require('fluent-ffmpeg');
const path = require('path');
const config = require('../config.js');

// #todo order of parameters should be the same for each function...
export function ffprobe (baseDir, outputHandler ) {
  console.log('Starting FFprobe'); 
  const input = resolve.getFilePathByType('source', baseDir);

  return new Promise((resolve, reject) => {

      const args = [
          '-v', 'error',
          '-print_format', 'json',
          '-show_format',
          '-show_streams',
          '-i', input
      ];

      console.log(input);

      const cb = (error, stdout, stderr) => {
          if (error) {
              reject(error);
              console.log("There has been an error performing ffprobe");
              console.log(error);
              console.log(stderr);
          }

          const outputObj = JSON.parse(stdout);

          const hasVideoStream = outputObj.streams.some(stream =>
              stream.codec_type === 'video' &&
              (stream.duration || outputObj.format.duration) <= config.videoMaxDuration
          );

          if (!hasVideoStream)
              reject('FFprobe: no valid video stream found');
          else {
            // valid video stream found, propagate desired data 
            outputHandler({
              'movieLength': outputObj.format.duration,
              'type': 'video/mp4',
            });

            console.log('Valid video stream found. FFprobe finished.');
            resolve();
          }
      };

      execFile('ffprobe', ['-version']);

      execFile('ffprobe', args, cb)
          .on('error', reject);
  });
};

export function scaleDown(messageHandler, baseDir) {
    // #todo, merge these config files into one application config
    const lowresFileName = resolve.getFileNameByType('lowres', baseDir);
    const input = resolve.getFilePathByType('source', baseDir);
    const output = resolve.destinationFile('lowres', baseDir, lowresFileName);
    const scaleFilter = `scale='min(${config.videoMaxWidth.toString()}\\,iw):-2'`;

    const data = {
      'videoLowres': lowresFileName
    };

    return new Promise((resolve:any, reject) => {
      let command = new FfmpegCommand(input, { logger: console})
        .videoFilters(scaleFilter)
        .output(output)
        .on('error', (err) => { 
          console.log("error ocurred", err);
          reject(err);
        })
        .on('start', (commandLine) => {console.log('Spawned Ffmpeg with command: ' + commandLine)})
        .on('progress', (msg) => { messageHandler(msg)})
        .on('end', () => {
          console.log("Done processing")
          resolve(data);
        })
        .run();
    });
};

export function burnSrt(baseDir) {
    // burn .srt file over video source file
    const input = resolve.getFilePathByType('source', baseDir);
    const srtFile = resolve.getFilePathByType('subtitle', baseDir);

    // #todo extension in resolver and config
    const output = `${resolve.getFilePathByType('subtitledSource', baseDir)}`;

    return new Promise((resolve, reject) => {
        let command = new FfmpegCommand(input, { logger: console})
            .outputOptions(`-vf subtitles=${srtFile}`)
            .output(output)
            .on('error', (err) => { 
                console.error("error ocurred", err);
                reject(err);
            })
            .on('start', (commandLine) => {console.log('Spawned Ffmpeg with command: ' + commandLine)})
            .on('progress', (msg) => { console.log(msg)})
            .on('end', () => {
                console.log('done burning subs'); 
                resolve();
            })
            .run();
    });
}


