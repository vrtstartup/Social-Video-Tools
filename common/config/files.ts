import { resolve } from 'path';

export const fileConfig = {
  workingDirectory: `${resolve('data')}`,
  files: {
    source: {
      directory: 'source',
      name: 'source_file',
      extension: 'mp4',
      unique: true
    },
    lowres: {
      directory: 'build_artefacts',
      name: 'scaled_down',
      extension: 'mp4',
      unique: true
    },
    subtitle: {
      directory: 'build_artefacts',
      name: 'subtitle',
      extension: 'srt',
      unique: true
    },
    ass: {
      directory: 'build_artefacts',
      name: 'subtitles',
      extension: 'ass',
      unique: true,
    },
    render: {
      directory: 'out',
      name: 'render',
      extension: 'mp4',
      unique: true
    },
    subtitledSource: {
      directory: 'build_artefacts',
      name: 'sourceSubtitled',
      extension: 'mp4',
      unique: true
    },
    overlay: {
      directory: 'overlays',
      name: '_overlay', // this is prepended with the overlay's id
      extension: 'mov',
      unique: false,
    }
  }
};