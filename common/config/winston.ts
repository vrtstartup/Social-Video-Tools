import { resolve } from 'path';
import * as fs from 'fs';

const winston = require('winston');

const tsFormat = () => (new Date()).toLocaleTimeString();
const logDir = resolve('logs');
const env = process.env.NODE_ENV;

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export const logger = new (winston.Logger)({
  levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5},
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: 'debug'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: `${logDir}/error.log`,
      timestamp: tsFormat,
      colorize: true,
      level: 'error'
    }),
    new (winston.transports.File)({
      name: 'warning-file',
      filename: `${logDir}/warning.log`,
      timestamp: tsFormat,
      colorize: true,
      level: 'warn'
    }),
    new (winston.transports.File)({
      name: 'info-file',
      filename: `${logDir}/info.log`,
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'verbose-file',
      filename: `${logDir}/verbose.log`,
      timestamp: tsFormat,
      colorize: true,
      level: 'verbose'
    }),
    new (winston.transports.File)({
      name: 'debug-file',
      filename: `${logDir}/debug.log`,
      timestamp: tsFormat,
      colorize: true,
      level: 'debug'
    }),
    new (winston.transports.File)({
      name: 'silly-file',
      filename: `${logDir}/silly.log`,
      timestamp: tsFormat,
      colorize: true,
      level: 'silly'
    })
  ]
});