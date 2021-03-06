import { resolve } from 'path';

export const fileConfig = {
  workingDirectory: process.env.DATA_FOLDER || resolve('data'),
  sharedDirectory: resolve('/app/data', 'shared'),
  files: {
    source: {
      directory: 'projects',
      name: 'source_file',
      extension: 'mp4',
      mime: 'video/mp4',
    },
    lowres: {
      directory: 'projects',
      name: 'scaled_down',
      extension: 'mp4',
      mime: 'video/mp4',
    },
    ass: {
      directory: 'projects',
      name: 'subtitles',
      extension: 'ass',
      mime: 'text/plain',
    },
    thumb: {
      directory: 'projects',
      name: 'thumb',
      extension: 'png',
      mime: 'image/png',
    },
    render: {
      directory: 'projects',
      name: 'render',
      extension: 'mp4',
      mime: 'video/mp4',
    },
    overlay: {
      directory: 'projects',
      extension: 'mov',
      mime: 'video/quicktime',
    },
    outro: {
      directory: 'assets/bumper',
      extension: 'mov',
      mime: 'video/quicktime',
      shared: true
    },
    logo: {
      directory: 'assets/logo',
      extension: 'mov',
      mime: 'video/quicktime',
      shared: true,
    }
  }
};