import { resolve } from 'path';

export const fileConfig = {
  workingDirectory: resolve('data'),
  sharedDirectory: resolve('data', 'shared'),
  files: {
    source: {
      directory: 'source',
      name: 'source_file',
      extension: 'mp4',
    },
    lowres: {
      directory: 'build_artefacts',
      name: 'scaled_down',
      extension: 'mp4',
    },
    srt: {
      directory: 'build_artefacts',
      name: 'subtitles',
      extension: 'srt',
    },
    ass: {
      directory: 'build_artefacts',
      name: 'subtitles',
      extension: 'ass',
    },
    render: {
      directory: 'out',
      name: 'render',
      extension: 'mp4',
    },
    subtitledSource: {
      directory: 'build_artefacts',
      name: 'sourceSubtitled',
      extension: 'mp4',
    },
    overlay: {
      directory: 'overlays',
      extension: 'mov',
    },
    outro: {
      directory: 'bumpers',
      extension: 'mov',
      shared: true
    },
    logo: {
      directory: 'logo',
      extension: 'mov',
      shared: true,
    }
  }
};