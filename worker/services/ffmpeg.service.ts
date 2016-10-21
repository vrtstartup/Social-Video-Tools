import {spawn, spawnSync, execFile} from 'child_process';
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
export function ffprobe (logger, filePath ) {
  logger.log('Starting FFprobe');

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
              logger.log("There has been an error performing ffprobe");
              logger.log(error);
              logger.log(stderr);
          }

          const outputObj = JSON.parse(stdout);

          const hasVideoStream = outputObj.streams.some(stream =>
              stream.codec_type === 'video' &&
              (stream.duration || outputObj.format.duration) <= config.videoMaxDuration
          );

          if (!hasVideoStream)
              reject('FFprobe: no valid video stream found');
          else {
              logger.log('Valid video stream found. FFprobe finished.');
              resolve();
          }
      };

      execFile('ffprobe', ['-version']);

      execFile('ffprobe', args, cb)
          .on('error', reject);
  });
};

/**
 * Runs the FFmpeg executable
 *
 * @param {!{log: !function}} logger - The platform logger
 * @param filePath - full path to file
 * @param workingDir - directory containing target file
 * @returns {Promise}
 */
export function ffmpeg(logger, fileName, workingDir) {
  logger.log('Starting FFmpeg');

  const scaleFilter = `scale='min(${config.videoMaxWidth.toString()}\\,iw):-2'`;

  return new Promise((resolve:any, reject) => {
    const filePath = `${workingDir}/${fileName}`;
    const videoLowres = `source-lowres.${config.format.video.extension}`;
    const thumbLowres = `${fileName}_LO.${config.format.image.extension}`;

    const args = [
      '-i', filePath,
      // '-c:a', 'copy',
      '-vf', scaleFilter,
      // '-movflags', '+faststart',
      videoLowres,
      // '-vf', 'thumbnail',
      // '-vframes', '1',
      // thumbLowres
    ];

    const opts = {
      cwd: workingDir
    };

  const data = {
    'baseDir': filePath,
    'videoLowres': videoLowres,
    'thumb': thumbLowres
  };

  spawn('ffmpeg', args, opts)
      .on('message', msg => logger.log(msg))
      .on('error', reject)
      .on('close', resolve(data));
  });
}


