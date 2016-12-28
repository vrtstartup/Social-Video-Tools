import { config } from '../../common/config';
import { db } from '../../common/services/firebase.service';
import { logger } from '../config/winston';
const restler = require('restler');

export class Message {

  constructor() {}

  send(user, message, location){
    return new Promise((resolve, reject) => {
      // compose timestamp 
      const date = new Date();

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const mins = date.getMinutes();

      const stamp = `${day}/${month}/${year} at ${hour}hrs`;

      db.ref(`feedback/${day}-${month}-${year}`).push({
        user: user,
        message: message,
        timestamp: stamp,
        location: location
      }).then(fbData => {
        // make call to webhook
        restler.post(config.webhook.hookUrl, { 
          data: {
            value1: user,
            value2: message,
            value3: stamp
          },
        })
        .on('complete', resolve)
        .on('error', reject);
      }, logger.warn);
    });
  }
}