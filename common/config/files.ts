import { resolve } from 'path';

export const fileConfig = {
  workingDirectory: process.env.DATA_FOLDER || resolve('data'),
  sharedDirectory: resolve('/app/data', 'shared'),
  files: {
    source: {
      directory: './',
      name: 'source_file',
      extension: 'mp4',
      mime: 'video/mp4',
    },
    lowres: {
      directory: './',
      name: 'scaled_down',
      extension: 'mp4',
      mime: 'video/mp4',
    },
    srt: {
      directory: './',
      name: 'subtitles',
      extension: 'srt',
      mime: 'text/plain',
    },
    ass: {
      directory: './',
      name: 'subtitles',
      extension: 'ass',
      mime: 'text/plain',
    },
    render: {
      directory: './',
      name: 'render',
      extension: 'mp4',
      mime: 'video/mp4',
    },
    subtitledSource: {
      directory: './',
      name: 'sourceSubtitled',
      extension: 'mp4',
      mime: 'video/mp4',
    },
    overlay: {
      directory: 'overlays',
      extension: 'mov',
      mime: 'video/quicktime',
    },
    outro: {
      directory: 'bumpers',
      extension: 'mov',
      mime: 'video/quicktime',
      shared: true
    },
    logo: {
      directory: 'logo',
      extension: 'mov',
      mime: 'video/quicktime',
      shared: true,
    }
  }
};