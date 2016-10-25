import {spawn, spawnSync, execFile} from 'child_process';
var FfmpegCommand = require('fluent-ffmpeg');
const path = require('path');
const config = require('../config.js');

/**
 * Runs FFprobe and ensures that the input file has a valid stream and meets the maximum duration threshold.
 *
 * @param {!{log: !function}} logger - The platform logger
 * @param filePath - full path to file
 * @param workingDir - directory containing target file
 * @returns {Promise}
 */
export function ffprobe (filePath, outputHandler ) {
  console.log('Starting FFprobe');
  
  return new Promise((resolve, reject) => {

      const args = [
          '-v', 'error',
          '-print_format', 'json',
          '-show_format',
          '-show_streams',
          '-i', filePath
      ];

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
              'movieLength': outputObj.format.duration
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

export function scaleDown(messageHandler, fileName, workingDir) {
    const filePath = path.resolve(workingDir,fileName);
    const lowresName = `source-lowres.${config.format.video.extension}`;
    const output = path.resolve(workingDir, lowresName);
    const scaleFilter = `scale='min(${config.videoMaxWidth.toString()}\\,iw):-2'`;

    const data = {
      'baseDir': filePath,
      'videoLowres': lowresName
    };

    return new Promise((resolve:any, reject) => {
      let command = new FfmpegCommand(filePath, { logger: console})
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


