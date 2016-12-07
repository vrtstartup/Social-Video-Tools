import { db } from '../../common/services/firebase.service';

export class Styles {
  private logger;

  constructor(logger: any) { 
    this.logger = logger;
  }

  getAll() {
    return new Promise((resolve, reject) => {
      db.ref('styles').once('value')
        .then(snapshot => resolve(snapshot.val()), err => this.logger.error(err));
    });
  }
}