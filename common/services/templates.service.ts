import { db } from './firebase.service';
import { logger } from '../config/winston';

export class Templates {
  private logger;

  constructor() { }

  getAll() {
    return new Promise((resolve, reject) => {
      db.ref('templates').once('value')
        .then(snapshot => resolve(snapshot.val()), err => logger.error(err));
    });
  }
}