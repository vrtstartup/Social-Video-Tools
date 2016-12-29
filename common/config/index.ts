import { encodingConfig } from './encoding';
import { fileConfig } from './files';
import { fbConfig } from './firebase';
import { routingConfig } from './routing';
import { mailConfig } from './mail';
import { logger } from './winston';
import { storage } from './s3';
import { uploader } from './uploader';
import { webhook } from './feedback';

export const config = { 
  encoding: encodingConfig,
  filesystem: fileConfig,
  storage: storage,
  firebase: fbConfig,
  routing: routingConfig,
  webhook: webhook,
  mail: mailConfig,
  uploader: uploader,
  logger: logger
}