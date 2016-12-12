import { db } from '../../common/services/firebase.service';
import { logger } from '../config/winston';

export class Styles {
  private logger;

  constructor() {}

  getAll() {
    return new Promise((resolve, reject) => {
      db.ref('styles').once('value')
        .then(snapshot => resolve(snapshot.val()), err => logger.error(err));
    });
  }
}