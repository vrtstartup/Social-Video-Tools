import {spawn, spawnSync, execFile} from 'child_process';
import * as resolver from '../../common/services/resolver.service';
import { config } from '../../common/config';

var FfmpegCommand = require('fluent-ffmpeg');
const path = require('path');

const logger = config.logger;

export function ffprobe (project) {
  logger.verbose('Starting FFprobe'); 
  const baseDir = project.data.files.baseDir;
  const input = resolver.storageUrl('source', baseDir);

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
            project.data['clip'] = {
                movieLength: parseFloat(outputObj.format.duration),
                type: 'video/mp4',
                frames: parseFloat(outputObj.streams[0].nb_frames),
                width: outputObj.streams[0].width,
                height: outputObj.streams[0].height
            }
            
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
    const input = resolver.storageUrl('source', baseDir); //#todo input stream instead of HTTP
    const output = resolver.getProjectFilePath('lowres', baseDir, false, lowresFileName);
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
            messageHandler(msg, job, 'status/downScaleProgress')
        })
        .on('end', () => {
          logger.verbose("Done processing")
          resolve(project);
        })
        .run();
    });
};

export function stitch(project, job, messageHandler) {
    // project data
    const clipData = project.data.clip;
    const baseDir = project.data.files.baseDir;
    const arrOverlays = project.overlayArray('overlay');
    const arrLogos = project.overlayArray('logo');
    const outro = project.hasAnnotations('outro') ? project.getOutro() : false;

    // composition data
    const width = clipData.width;
    const height = clipData.height;
    const sourceLength = Number(clipData.movieLength);
    let renderDuration = (outro) ? sourceLength + (Number(outro.duration) - Number(outro.transitionDuration)) : sourceLength;

    // project files
    const assFile = resolver.getProjectFilePath('ass', baseDir, true);
    const sourceFile = resolver.storageUrl('source', baseDir); //#todo input stream instead of HTTP
    const renderFile = resolver.getProjectFilePath('render', baseDir, true);
    const outroFile = outro.filePath;

    // used to wire ffmpeg inputs and outputs together
    const arrInputs = [];
    const arrOutputs = ['1:v'];  // [1:v] is the black backdrop

    // instantiate new command
    let command = new FfmpegCommand();

    // add some always-there inputs (backdrop, source)
    registerInput('0:v', {filePath: sourceFile}); // original source
    registerInput('1:v', {filePath: `color=c=black:s=${width}x${height},trim=duration=${renderDuration}`},'lavfi');  // black backdrop
    
    // add overlay inputs 
    arrOverlays.forEach(overlay => registerInput(`${arrInputs.length}:v`, overlay));

    // add logo inputs
    arrLogos.forEach(logo => registerInput(`${arrInputs.length}:v`, logo));

    // add outro input
     if(outro) registerInput(`${arrInputs.length}:v`, outro);

     return new Promise((resolve, reject) => {
        const filter = complexFilter();
        const output = project.hasAnnotations('subtitle') ? 'out_subs' : lastOutput();

        command
            .complexFilter([filter], output)
            .output(renderFile)
            .on('start', command => logger.verbose(`Spawned ffmpeg with command: ${command}`))
            .on('progress', msg => {
                // append some extra data to the progress message
                msg.progress = Math.min(Math.round((msg.frames / project.data.clip.frames) * 1000) / 10, 100); // encoding progress
                messageHandler(msg, job, 'status/stitchingProgress')
            })
            .on('end', () => {
                logger.verbose('movie rendering done.');
                resolve(project)
            })
            .on('error', (err, stdout, stderr) => {
                logger.error(err);
                logger.debug(`encountered error during ffmpeg render: ${stdout}`);
                logger.debug(`encountered error during ffmpeg render: ${stderr}`);
                reject(err);
            })
            .run();
     });

     // encapsulated functions, operate on variables specific to stitch() function
     function registerInput(inputName:string, overlayData:Object, format?:string) {  
        // register input in arrInputs
        arrInputs.push({
            name: inputName,
            data: overlayData
        });

        command = command.input(overlayData['filePath']);
        if(format) command = command.inputFormat(format);
    }

    function complexFilter() {
        let filter = '';

        // set starting position and scale for inputs
        arrInputs.forEach(input => addLine(setPosAndScale(input)));

        // source and backdrop overlay 
        addLine(overlayFilter(lastOutput(), arrInputs[0]));

        // overlay filters for remaining other inputs
        for(let i=2 ; i < arrInputs.length ; i++){ 
            const input = arrInputs[i];
           addLine(overlayFilter(lastOutput(), input));
        }

        // audio
        addLine('amix=inputs=1:duration=first:dropout_transition=3');

        // subtitles
        filter += project.hasAnnotations('subtitle') ? `;[${lastOutput()}]ass=${assFile}[out_subs]` : ''; // #todo semicolon handling isnt very good. last filter should not have a semicolon

        return filter;

        function addLine(line:string){
            if(line) filter += (filter === '') ? line : ';' + line;
        }
    }

    function lastOutput() { return arrOutputs[ arrOutputs.length - 1 ] }

    function setPosAndScale(input:Object) {
        let line = '';
        let outputName = input['name'];
        const blacklist = ['0:v', '1:v']; // don't translate or scale these inputs #todo 0:v and 1:v are source and backdrop respectively

        if(blacklist.indexOf(input['name']) === -1){
            const inputName = input['name'];
            outputName = inputName.replace(':v', '_scaled');
            const overlayWidth = input['data'].width;
            const desiredScale = input['data'].scale;
            const scaleWidth = desiredScale ? width * (width / (overlayWidth * desiredScale)) : width;
            line = `[${input['name']}]setpts=PTS-STARTPTS+${input['data']['start']}/TB,scale=${scaleWidth}:-1[${outputName}]`
        };
       
        input['name'] = outputName; // input has a new name

        return line;
    }

    function overlayFilter(output:string, input:Object){
        const newOutputName = input['name'] + '_' + output;
        arrOutputs.push(newOutputName);

        return `[${output}][${input['name']}]overlay=x=0:y=0[${newOutputName}]`;
    }
}





