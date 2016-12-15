import { encodingConfig } from './encoding';
import { fileConfig } from './files';
import { fbConfig } from './firebase';
import { routingConfig } from './routing';
import { mailConfig } from './mail';
import { logger } from './winston';
import { storage } from './s3';
import { uploader } from './uploader';

export const config = { 
  encoding: encodingConfig,
  filesystem: fileConfig,
  storage: storage,
  firebase: fbConfig,
  routing: routingConfig,
  mail: mailConfig,
  uploader: uploader,
  logger: logger
}