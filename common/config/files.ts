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
    srt: {
      directory: 'projects',
      name: 'subtitles',
      extension: 'srt',
      mime: 'text/plain',
    },
    ass: {
      directory: 'projects',
      name: 'subtitles',
      extension: 'ass',
      mime: 'text/plain',
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
      directory: 'assets',
      extension: 'mov',
      mime: 'video/quicktime',
      shared: true
    },
    logo: {
      directory: 'assets',
      extension: 'mov',
      mime: 'video/quicktime',
      shared: true,
    }
  }
};