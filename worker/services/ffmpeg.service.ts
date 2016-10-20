import {spawn, execFile} from 'child_process';
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

  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-loglevel', 'warning',
      '-i', workingDir + fileName,
      '-c:a', 'copy',
      '-vf', scaleFilter,
      '-movflags', '+faststart',
      `${fileName}_LO.${config.format.video.extension}`,
      '-vf', 'thumbnail',
      '-vf', scaleFilter,
      '-vframes', '1',
      `${fileName}_LO.${config.format.image.extension}`
    ];
    const opts = {
      cwd: workingDir
    };
    
    spawn('ffmpeg', args, opts)
      .on('message', msg => logger.log(msg))
      .on('error', reject)
      .on('close', resolve);
  });
}


