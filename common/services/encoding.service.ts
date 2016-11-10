// #todo: rename to encoding.service
import {spawn, spawnSync, execFile} from 'child_process';
import * as resolver from '../../common/services/resolver.service';
import { logger } from '../../common/config/winston';
var FfmpegCommand = require('fluent-ffmpeg');
const path = require('path');
const config = require('../config/encoding');

// #todo order of parameters should be the same for each function...
export function ffprobe (project) {
  logger.verbose('Starting FFprobe'); 
  const baseDir = project.data.files.baseDir;
  const input = resolver.getFilePathByType('source', baseDir);

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
            logger.verbose('Valid video stream found. FFprobe finished.');

            // Append new data to the project object 
            project.data.clip.movieLength = outputObj.format.duration;
            project.data.clip.type = 'video/mp4';
            project.data.clip.frames = outputObj.streams[0].nb_frames // #todo how do we store which stream is eligible for stitching?
            
            resolve(project);
          }
      };

      execFile('ffprobe', ['-version']);

      execFile('ffprobe', args, cb)
          .on('error', reject);
  });
};

export function scaleDown(project, messageHandler, job) {
    const baseDir = project.data.files.baseDir;
    const lowresFileName = resolver.getFileNameByType('lowres', baseDir);
    const input = resolver.getFilePathByType('source', baseDir);
    const output = resolver.destinationFile('lowres', baseDir, lowresFileName);
    const scaleFilter = `scale='min(${config.videoMaxWidth.toString()}\\,iw):-2'`;

    return new Promise((resolve:any, reject) => {
      let command = new FfmpegCommand(input, { logger: logger})
        .videoFilters(scaleFilter)
        .output(output)
        .on('error', (err) => { 
          logger.error(err);
          reject(err);
        })
        .on('start', (commandLine) => {logger.verbose('Spawned Ffmpeg with command: ' + commandLine)})
        .on('progress', (msg) => { 
            // append some extra data to the progress message
            msg.progress = Math.round((msg.frames / project.data.clip.frames) * 1000) / 10; // encoding progress
            messageHandler(msg, job)
        })
        .on('end', () => {
          logger.verbose("Done processing")
          resolve(project);
        })
        .run();
    });
};

export function burnSrt(project) {
    // burn .srt file over video source file
    const baseDir = project.data.files.baseDir; 
    const input = resolver.getFilePathByType('source', baseDir);
    const srtFile = resolver.getFilePathByType('subtitle', baseDir);

    // #todo extension in resolver and config
    const output = `${resolver.getFilePathByType('subtitledSource', baseDir)}`;

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
                resolve(project);
            })
            .run();
    });
}


