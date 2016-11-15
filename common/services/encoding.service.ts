// #todo: rename to encoding.service
import {spawn, spawnSync, execFile} from 'child_process';
import * as resolver from '../../common/services/resolver.service';
import { config } from '../../common/config';

var FfmpegCommand = require('fluent-ffmpeg');
const path = require('path');

const logger = config.logger;

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
              (stream.duration || outputObj.format.duration) <= config.encoding.videoMaxDuration
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
            project.data.clip.width = outputObj.streams[0].width
            project.data.clip.height = outputObj.streams[0].height
            
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
    const scaleFilter = `scale='min(${config.encoding.videoMaxWidth.toString()}\\,iw):-2'`;

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

export function stitch(project) {
    let arrOverlays = project.overlayArray();

    let width = project.data.clip.width;
    let height = project.data.clip.height;
    let duration = project.data.clip.movieLength;

    let source = resolver.getFilePathByType('source', project.data.id);
    let destination = resolver.getFilePathByType('render', project.data.id);

    /* ------------------------------- */
    /* -- SET INPUTS ----------------- */
    /* ------------------------------- */
    let command = new FfmpegCommand();

    command
        .input(`color=c=black:s=${width}x${height},trim=duration=${duration}`)
        .inputFormat('lavfi')   //0:v
        .input(source);         //1:v

    // overlays
    arrOverlays.forEach((el) => command = command.input(el.path));

    // final 
    command
        .complexFilter([makeComplexFilter(arrOverlays)], 'output')
        .saveToFile(destination, (stdout, stderr) => logger.verbose(`file has been created: ${destination}`))
        .on('start', command => logger.verbose(`Spawned ffmpeg with command: ${command}`))
        .on('progress', progress => logger.verbose(progress))
        .on('end', () => logger.verbose('movie rendering done.'))
        .on('error', (err, stdout, stderr) => {
            logger.error(err);
            logger.debug(`encountered error during ffmpeg render: ${stdout}`);
            logger.debug(`encountered error during ffmpeg render: ${stderr}`);
        });

    
    /* ------------------------------- */
    /* -- SET START & SCALE ---------- */
    /* ------------------------------- */
    function setStartPosAndScale(arrOverlays) {
        let startAndScaleLine = '';
        
        arrOverlays.forEach((el, i) => {
            // skip first two inputs (backdrop & source)
            const scale = el.scale ? width/el.scale : width; // only logo has extra scale value 
            startAndScaleLine = `${startAndScaleLine}[${i+2}:v]setpts=PTS-STARTPTS+${el.start}/TB,scale=${scale}:-1[${i}];`
        });

        return startAndScaleLine;
    }

    /* ------------------------------- */
    /* -- MERGE OVERLAYS  ------------ */
    /* ------------------------------- */
    function makeOverlayString(arrOverlays) {
        let overlayLine = '';
        let output = '';

        let arrKeys = ['movie'];
        arrOverlays.forEach((el, i) => arrKeys.push(`${i}`));
        
        // [ 'movie', '0', '1', '2', '3', '4' ]
        while(arrKeys.length > 1){
            output = `${arrKeys[0]}_${arrKeys[1]}`;

            // not including logos yet
            overlayLine += `[${arrKeys[0]}][${arrKeys[1]}]overlay=x=0:y=0[${output}];`;

            arrKeys.splice(0, 2, output);
        }

        overlayLine = overlayLine.replace(output, 'output'); // replace output by outputname
        return overlayLine ;
    }

    /* ------------------------------- */
    /* -- COMBINE LINES -------------- */
    /* ------------------------------- */
    function makeComplexFilter(arrOverlays){
        let complexLine = '';

        // no logo - no bumper - no titles
        if(!arrOverlays.length) {
            complexLine = '[0:v][1:v]overlay=x=0:y=0[output]';
            return complexLine;
        }

        complexLine = '[0:v][1:v]overlay=x=0:y=0[movie];'; // movie on black-container
        complexLine += setStartPosAndScale(arrOverlays) + makeOverlayString(arrOverlays);

        complexLine += 'amix=inputs=1:duration=first:dropout_transition=3' ; // audio 
        // complexLine += '[output]ass=temp/test/subtitles.ass[out_subs]' // #todo

        return `${complexLine}`;
    }

}


