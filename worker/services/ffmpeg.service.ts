// #todo: rename to encoding.service
import {spawn, spawnSync, execFile} from 'child_process';
import * as resolve from '../../common/services/resolver.service';
import { logger } from '../../common/config/winston';
var FfmpegCommand = require('fluent-ffmpeg');
const path = require('path');
const config = require('../config.js');

// #todo order of parameters should be the same for each function...
export function ffprobe (baseDir, outputHandler ) {
  logger.verbose('Starting FFprobe'); 
  const input = resolve.getFilePathByType('source', baseDir);

  return new Promise((resolve, reject) => {
      const args = [
          '-v', 'error',
          '-print_format', 'json',
          '-show_format',
          '-show_streams',
          '-i', input
      ];

      const cb = (error, stdout, stderr) => {
          if (error) {
              reject(error);
              logger.verbose("There has been an error performing ffprobe");
              logger.error(error);
              logger.error(stderr);
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

            logger.verbose('Valid video stream found. FFprobe finished.');
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
      let command = new FfmpegCommand(input, { logger: logger})
        .videoFilters(scaleFilter)
        .output(output)
        .on('error', (err) => { 
          logger.error(err);
          reject(err);
        })
        .on('start', (commandLine) => {logger.verbose('Spawned Ffmpeg with command: ' + commandLine)})
        .on('progress', (msg) => { messageHandler(msg)})
        .on('end', () => {
          logger.verbose("Done processing")
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
        let command = new FfmpegCommand(input, { logger: logger})
            .outputOptions(`-vf subtitles=${srtFile}`)
            .output(output)
            .on('error', (err) => { 
                logger.error(err);
                reject(err);
            })
            .on('start', (commandLine) => {logger.debug('Spawned Ffmpeg with command: ' + commandLine)})
            .on('progress', (msg) => { logger.verbose(msg)})
            .on('end', () => {
                logger.verbose('done burning subs'); 
                resolve();
            })
            .run();
    });
}


