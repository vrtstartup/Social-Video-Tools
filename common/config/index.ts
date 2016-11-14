import { encodingConfig } from './encoding';
import { fileConfig } from './files';
import { fbConfig } from './firebase';
import { routingConfig } from './routing';
import { logger } from './winston';

export const config = { 
  encoding: encodingConfig,
  filesystem: fileConfig,
  firebase: fbConfig,
  routing: routingConfig,
  logger: logger
}