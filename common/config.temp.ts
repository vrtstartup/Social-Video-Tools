import { resolve } from 'path';

export const appConfig = {
  workingDirectory: `${resolve('somedirectory')}`,
  subDirectories: {
    source: './',
    lowres: './',
    subtitle: './',
    clip: 'clips',
    render:'./',
    subtitledSource: './' // #todo - this is bad
  },
  fileNames: {
    source: 'source',
    lowres: 'lowres',
    subtitle: 'subtitle',
    render:'render',
    subtitledSource: 'sourceSubtitled'
  }
};